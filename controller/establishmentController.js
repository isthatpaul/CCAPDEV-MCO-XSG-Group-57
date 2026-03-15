const Establishment = require('../model/Establishment');
const Review = require('../model/Review');
const User = require('../model/User');
const cloudinary = require('../config/cloudinary');
const { getBusinessStatus, getRecommendations } = require('../utils/businessHelpers');
const { extractPublicIdFromUrl } = require('../utils/cloudinaryHelpers');

// Helper function to recalculate ratings for establishments
async function recalculateEstablishmentRatings(establishments) {
    try {
        const establishmentIds = establishments.map(e => e._id);
        const reviews = await Review.find({ establishmentId: { $in: establishmentIds } }).lean();
        
        // Group reviews by establishment
        const reviewsByEst = {};
        reviews.forEach(review => {
            const estId = review.establishmentId.toString();
            if (!reviewsByEst[estId]) {
                reviewsByEst[estId] = [];
            }
            reviewsByEst[estId].push(review);
        });
        
        // Update establishments with calculated ratings
        establishments.forEach(est => {
            const estId = est._id.toString();
            const estReviews = reviewsByEst[estId] || [];
            
            if (estReviews.length > 0) {
                const averageRating = estReviews.reduce((sum, review) => sum + review.rating, 0) / estReviews.length;
                est.rating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
            } else {
                est.rating = 0;
            }
        });
        
        return establishments;
    } catch (err) {
        console.error('Error recalculating establishment ratings:', err);
        return establishments; // Return original if there's an error
    }
}

const establishmentController = {

    async getHome(req, res) {
        try {
            let establishments = await Establishment.find().limit(3).lean();

            // Recalculate ratings based on reviews
            establishments = await recalculateEstablishmentRatings(establishments);

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

            // Don't filter by rating in database query - we'll recalculate and filter after
            let establishments = await Establishment.find(filter).lean();

            // Recalculate ratings based on reviews
            establishments = await recalculateEstablishmentRatings(establishments);

            // Apply rating filter after recalculation
            if (minRating > 0) {
                establishments = establishments.filter(est => est.rating >= minRating);
            }

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

            // Calculate rating breakdown for display
            const allReviews = await Review.find({ establishmentId: establishment._id }).lean();
            const ratingNames = ['one', 'two', 'three', 'four', 'five'];
            const ratingBreakdown = allReviews.reduce((acc, r) => {
                const key = ratingNames[r.rating - 1];
                if (key) acc[key]++;
                return acc;
            }, { one: 0, two: 0, three: 0, four: 0, five: 0, total: allReviews.length });

            // Recalculate establishment rating based on reviews
            if (allReviews.length > 0) {
                const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
                establishment.rating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
            } else {
                establishment.rating = 0;
            }

            // Get business status
            const businessStatus = getBusinessStatus(establishment.hours);

            // Get recommendations
            let allEstablishments = await Establishment.find().lean();
            allEstablishments = await recalculateEstablishmentRatings(allEstablishments);
            const recommendations = getRecommendations(establishment, allEstablishments);

            let canEdit = false;
            let isFavorited = false;
            let userHasVoted = {};

            if (req.session.userId) {
                const user = await User.findById(req.session.userId).lean();
                if (user && user.isAdmin) {
                    const managedIds = user.establishmentsManaged.map(id => id.toString());
                    if (managedIds.includes(establishment._id.toString())) {
                        canEdit = true;
                    }
                }
                if (user && user.favorites) {
                    isFavorited = user.favorites.some(
                        fav => fav.toString() === establishment._id.toString()
                    );
                }
                // Track user votes
                if (user) {
                    const helpfulIds = (user.helpfulReviewVotes || []).map(id => id.toString());
                    const unhelpfulIds = (user.unhelpfulReviewVotes || []).map(id => id.toString());
                    reviews.forEach(review => {
                        userHasVoted[review._id.toString()] = {
                            helpful: helpfulIds.includes(review._id.toString()),
                            unhelpful: unhelpfulIds.includes(review._id.toString())
                        };
                    });
                }
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
                ratingBreakdown,
                userHasVoted,
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
            const { name, location, contact, hours, link, description, category, phone } = req.body;
            const establishment = await Establishment.findById(req.params.id);
            if (!establishment) return res.status(404).send('Establishment not found');

            if (!req.session.userId) return res.status(401).send('Unauthorized');
            const user = await User.findById(req.session.userId).lean();
            const managedIds = (user?.establishmentsManaged || []).map(id => id.toString());
            if (!user?.isAdmin || !managedIds.includes(establishment._id.toString())) {
                return res.status(403).send('You do not have permission to edit this establishment');
            }

            // Transform hours from form format to schema format
            const hoursArray = [];
            for (let i = 0; i < 7; i++) {
                const dayHours = {
                    dayOfWeek: i,
                    openTime: hours?.[i]?.openTime || '09:00',
                    closeTime: hours?.[i]?.closeTime || '17:00',
                    isClosed: hours?.[i]?.isClosed === 'on' || false
                };
                hoursArray.push(dayHours);
            }

            // Handle image replacement
            const updateData = { name, location, contact, phone, hours: hoursArray, link, description, category };
            if (req.file) {
                // Upload new image to Cloudinary
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: `cloudinary/establishments/${name}`,
                        resource_type: 'auto'
                    }, (error, uploadResult) => {
                        if (error) reject(error);
                        else resolve(uploadResult);
                    });
                    uploadStream.end(req.file.buffer);
                });
                // Delete old Cloudinary image if it exists
                if (establishment.image && establishment.image.startsWith('https://res.cloudinary.com')) {
                    const publicId = extractPublicIdFromUrl(establishment.image);
                    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
                }
                updateData.image = result.secure_url;
            }

            await Establishment.findByIdAndUpdate(req.params.id, updateData);
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
            const { name, location, contact, hours, link, description, category, phone } = req.body;
            const userId = req.session.userId;

            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            // Get user to verify admin status
            const user = await User.findById(userId);
            if (!user || (user.adminType !== 'establishment_admin' && user.adminType !== 'database_admin')) {
                return res.status(403).send('You do not have permission to create establishments');
            }

            console.log('File received:', req.file ? 'Yes' : 'No');
            if (req.file) {
                console.log('File name:', req.file.originalname);
                console.log('File size:', req.file.size);
                console.log('File mimetype:', req.file.mimetype);
            }

            // Handle image upload to Cloudinary
            let imageUrl = '';
            if (req.file) {
                try {
                    console.log('Starting Cloudinary upload...');
                    
                    // Upload using buffer from memory storage with establishment name as folder
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream({
                            folder: `cloudinary/establishments/${name}`,
                            resource_type: 'auto'
                        }, (error, uploadResult) => {
                            if (error) {
                                console.error('Cloudinary error:', error);
                                reject(error);
                            } else {
                                console.log('Cloudinary upload successful:', uploadResult.secure_url);
                                resolve(uploadResult);
                            }
                        });
                        uploadStream.end(req.file.buffer);
                    });

                    imageUrl = result.secure_url;
                    console.log('Image URL set to:', imageUrl);
                } catch (uploadErr) {
                    console.error('Cloudinary upload failed:', uploadErr);
                    return res.status(500).send('Failed to upload image: ' + uploadErr.message);
                }
            } else {
                console.log('No file in request');
            }

            // Transform hours from form format to schema format
            const hoursArray = [];
            for (let i = 0; i < 7; i++) {
                const dayHours = {
                    dayOfWeek: i,
                    openTime: hours?.[i]?.openTime || '09:00',
                    closeTime: hours?.[i]?.closeTime || '17:00',
                    isClosed: hours?.[i]?.isClosed === 'on' || false
                };
                hoursArray.push(dayHours);
            }

            const establishment = await Establishment.create({
                name,
                location,
                contact: contact || '',
                phone: phone || '',
                hours: hoursArray,
                link: link || '',
                description: description || '',
                category: category || '',
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
            res.status(500).send('Failed to create establishment');
        }
    },

    async delete(req, res) {
        try {
            const establishment = await Establishment.findById(req.params.id);
            if (!establishment) return res.status(404).send('Establishment not found');

            if (!req.session.userId) return res.status(401).send('Unauthorized');
            const user = await User.findById(req.session.userId).lean();
            const managedIds = (user?.establishmentsManaged || []).map(id => id.toString());
            if (!user?.isAdmin || !managedIds.includes(establishment._id.toString())) {
                return res.status(403).send('You do not have permission to delete this establishment');
            }

            // Delete establishment image from Cloudinary if it exists
            if (establishment.image && establishment.image.startsWith('https://res.cloudinary.com')) {
                try {
                    const publicId = extractPublicIdFromUrl(establishment.image);
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