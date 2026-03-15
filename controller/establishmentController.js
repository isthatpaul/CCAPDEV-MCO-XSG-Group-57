const Establishment = require('../model/Establishment');
const Review = require('../model/Review');
const User = require('../model/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { getBusinessStatus, getRecommendations } = require('../utils/businessHelpers');

const establishmentController = {
    // Helper function to extract public_id from Cloudinary URL
    extractPublicIdFromUrl(url) {
        if (!url || !url.startsWith('https://res.cloudinary.com')) {
            return null;
        }
        try {
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.ext
            // We need: folder/filename (without extension)
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            
            const pathParts = parts[1].split('/');
            // Remove version number if present (v123456)
            let startIdx = pathParts[0].startsWith('v') ? 1 : 0;
            
            // Join remaining parts and remove file extension
            const publicId = pathParts.slice(startIdx).join('/');
            return publicId.split('.')[0]; // Remove file extension
        } catch (err) {
            console.error('Error extracting public_id:', err);
            return null;
        }
    },

    async getHome(req, res) {
        try {
            let establishments = await Establishment.find().limit(3).lean();

            // Add business status
            establishments = establishments.map(est => ({
                ...est,
                businessStatus: getBusinessStatus(est.hours)
            }));

            const reviews = await Review.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'name')
                .populate('establishmentId', 'name image')
                .lean();

            res.render('index', {
                title: 'Home',
                establishments,
                reviews
            });
        } catch (err) {
            console.error('Home error:', err);
            res.status(500).send('Server error');
        }
    },

    async getAll(req, res) {
        try {
            const query = req.query.q;
            const minRating = req.query.rating ? parseFloat(req.query.rating) : 0;
            const sortBy = req.query.sort || 'newest';
            
            let filter = {};
            
            if (query) {
                filter.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { location: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ];
            }

            if (minRating > 0) {
                filter.rating = { $gte: minRating };
            }

            let establishments = await Establishment.find(filter).lean();

            // Add business status to each establishment
            establishments = establishments.map(est => ({
                ...est,
                businessStatus: getBusinessStatus(est.hours)
            }));

            // Apply sorting
            if (sortBy === 'rating-high') {
                establishments.sort((a, b) => b.rating - a.rating);
            } else if (sortBy === 'rating-low') {
                establishments.sort((a, b) => a.rating - b.rating);
            }

            res.render('establishments/index', {
                title: 'Establishments',
                establishments,
                query,
                minRating,
                sortBy,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error('Establishments error:', err);
            res.status(500).send('Server error');
        }
    },

    async getOne(req, res) {
        try {
            const establishment = await Establishment.findById(req.params.id).lean();
            if (!establishment) return res.status(404).send('Not found');

            const ratingFilter = req.query.rating ? parseInt(req.query.rating) : null;
            const sortBy = req.query.sort || 'newest';

            let reviewFilter = { establishmentId: establishment._id };
            if (ratingFilter) {
                reviewFilter.rating = ratingFilter;
            }

            let reviews = await Review.find(reviewFilter)
                .populate('userId', 'name image')
                .lean();

            // Apply sorting
            if (sortBy === 'highest-rated') {
                reviews.sort((a, b) => b.rating - a.rating);
            } else if (sortBy === 'lowest-rated') {
                reviews.sort((a, b) => a.rating - b.rating);
            } else if (sortBy === 'most-helpful') {
                reviews.sort((a, b) => b.helpfulVotes.length - a.helpfulVotes.length);
            } else {
                reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }

            // Get business status
            const businessStatus = getBusinessStatus(establishment.hours);

            // Get recommendations
            const allEstablishments = await Establishment.find().lean();
            const recommendations = getRecommendations(establishment, allEstablishments);

            let canEdit = false;
            let isFavorited = false;

            if (req.session.userId) {
                const user = await User.findById(req.session.userId).lean();
                if (user && user.isAdmin) {
                    const managedIds = user.establishmentsManaged.map(id => id.toString());
                    if (managedIds.includes(establishment._id.toString())) {
                        canEdit = true;
                    }
                }
                isFavorited = user && user.favorites && user.favorites.includes(establishment._id);
            }

            res.render('establishments/show', {
                title: establishment.name,
                establishment,
                reviews,
                canEdit,
                isFavorited,
                businessStatus,
                recommendations,
                ratingFilter,
                sortBy,
                extraCSS: 'establishment-detail.css',
                extraCSS2: 'establishments.css'
            });
        } catch (err) {
            console.error('Establishment detail error:', err);
            res.status(500).send('Server error');
        }
    },

    async update(req, res) {
        try {
            const { name, location, contact, hours, link, description } = req.body;
            const establishment = await Establishment.findById(req.params.id);
            if (!establishment) return res.status(404).send('Establishment not found');

            if (req.session.userId) {
                const user = await User.findById(req.session.userId).lean();
                if (user && user.isAdmin) {
                    const managedIds = user.establishmentsManaged.map(id => id.toString());
                    if (!managedIds.includes(establishment._id.toString())) {
                        return res.status(403).send('You do not have permission to edit this establishment');
                    }
                } else {
                    return res.status(403).send('You do not have permission to edit this establishment');
                }
            } else {
                return res.status(401).send('Unauthorized');
            }

            await Establishment.findByIdAndUpdate(req.params.id, {
                name, location, contact, hours, link, description
            });
            res.redirect('/establishments/' + req.params.id);
        } catch (err) {
            console.error('Update error:', err);
            res.status(500).send('Update failed');
        }
    },

    async getCreateForm(req, res) {
        try {
            res.render('establishments/new', {
                title: 'Add New Establishment',
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error('Create form error:', err);
            res.status(500).send('Server error');
        }
    },

    async create(req, res) {
        try {
            const { name, location, contact, hours, link, description } = req.body;
            const userId = req.session.userId;

            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            // Get user to verify admin status
            const user = await User.findById(userId);
            if (!user || (user.adminType !== 'establishment_admin' && user.adminType !== 'database_admin')) {
                return res.status(403).send('You do not have permission to create establishments');
            }

            // Handle image upload to Cloudinary
            let imageUrl = '';
            if (req.file) {
                try {
                    // Get user to get their email for folder structure
                    const uploadUser = await User.findById(userId);
                    if (!uploadUser) {
                        return res.status(404).send('User not found');
                    }

                    // Upload using buffer from memory storage with user email as identifier
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream({
                            folder: `cloudinary/users/${uploadUser.email}/establishment_images`,
                            resource_type: 'auto'
                        }, (error, uploadResult) => {
                            if (error) reject(error);
                            else resolve(uploadResult);
                        }).end(req.file.buffer);
                    });

                    imageUrl = result.secure_url;
                } catch (uploadErr) {
                    console.error('Cloudinary upload error:', uploadErr);
                    return res.status(500).send('Failed to upload image');
                }
            }

            const establishment = await Establishment.create({
                name,
                location,
                contact: contact || '',
                hours: hours || '',
                link: link || '',
                description: description || '',
                image: imageUrl,
                admin: userId
            });

            // Add establishment to user's managed list (if establishment_admin)
            if (user.adminType === 'establishment_admin') {
                user.establishmentsManaged.push(establishment._id);
                await user.save();
            }

            res.redirect('/establishments/' + establishment._id);
        } catch (err) {
            console.error('Create error:', err);
            if (req.file && req.file.path) {
                try { fs.unlinkSync(req.file.path); } catch (e) {}
            }
            res.status(500).send('Failed to create establishment');
        }
    },

    async delete(req, res) {
        try {
            const establishment = await Establishment.findById(req.params.id);
            if (!establishment) return res.status(404).send('Establishment not found');

            if (req.session.userId) {
                const user = await User.findById(req.session.userId).lean();
                if (user && user.isAdmin) {
                    const managedIds = user.establishmentsManaged.map(id => id.toString());
                    if (!managedIds.includes(establishment._id.toString())) {
                        return res.status(403).send('You do not have permission to delete this establishment');
                    }
                } else {
                    return res.status(403).send('You do not have permission to delete this establishment');
                }
            } else {
                return res.status(401).send('Unauthorized');
            }

            // Delete establishment image from Cloudinary if it exists
            if (establishment.image && establishment.image.startsWith('https://res.cloudinary.com')) {
                try {
                    const publicId = this.extractPublicIdFromUrl(establishment.image);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                        console.log('✓ Deleted Cloudinary image:', publicId);
                    }
                } catch (cloudinaryErr) {
                    console.error('Error deleting Cloudinary image:', cloudinaryErr);
                    // Continue with establishment deletion even if image deletion fails
                }
            }

            // Delete all reviews associated with this establishment
            await Review.deleteMany({ establishmentId: req.params.id });

            // Remove establishment from all users' managed lists
            await User.updateMany(
                { establishmentsManaged: req.params.id },
                { $pull: { establishmentsManaged: req.params.id } }
            );

            await Establishment.findByIdAndDelete(req.params.id);

            res.redirect('/establishments');
        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).send('Delete failed');
        }
    }
};

module.exports = establishmentController;