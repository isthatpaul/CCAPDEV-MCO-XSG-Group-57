const Review = require('../model/Review');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const reviewController = {
    // Helper function to extract public_id from Cloudinary URL
    extractPublicIdFromUrl(url) {
        if (!url || !url.startsWith('https://res.cloudinary.com')) {
            return null;
        }
        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            
            const pathParts = parts[1].split('/');
            let startIdx = pathParts[0].startsWith('v') ? 1 : 0;
            
            const publicId = pathParts.slice(startIdx).join('/');
            return publicId.split('.')[0];
        } catch (err) {
            console.error('Error extracting public_id:', err);
            return null;
        }
    },

    async create(req, res) {
        try {
            const { title, comment, rating, establishmentId } = req.body;

            const reviewData = {
                title,
                comment,
                rating: parseInt(rating),
                userId: req.session.userId,
                establishmentId,
                images: []
            };

            // Handle file uploads if any
            if (req.files && req.files.length > 0) {
                try {
                    for (const file of req.files) {
                        // Upload using buffer from memory storage
                        const uploadResult = await new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_stream({
                                folder: `cloudinary/users/${req.session.userId}/reviews/${establishmentId}`,
                                resource_type: 'auto'
                            }, (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }).end(file.buffer);
                        });

                        reviewData.images.push(uploadResult.secure_url);
                    }
                } catch (uploadErr) {
                    console.error('Cloudinary upload error:', uploadErr);
                    return res.status(500).send('Failed to upload images');
                }
            }

            await Review.create(reviewData);

            res.redirect('/establishments/' + establishmentId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to create review');
        }
    },

    async update(req, res) {
        try {
            const { title, comment, rating } = req.body;
            const review = await Review.findById(req.params.id);

            if (!review) return res.status(404).send('Review not found');

            await Review.findByIdAndUpdate(req.params.id, { title, comment, rating });

            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            res.status(500).send('Update failed');
        }
    },

    async delete(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) return res.status(404).send('Review not found');

            // Delete all associated images from Cloudinary
            if (review.images && review.images.length > 0) {
                for (const imageUrl of review.images) {
                    try {
                        const publicId = this.extractPublicIdFromUrl(imageUrl);
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId);
                            console.log('✓ Deleted review image from Cloudinary:', publicId);
                        }
                    } catch (deleteErr) {
                        console.error('Error deleting image:', deleteErr);
                        // Continue with other images even if one fails
                    }
                }
            }

            await Review.findByIdAndDelete(req.params.id);

            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Delete failed');
        }
    },

    async toggleHelpful(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) return res.status(404).send('Review not found');

            const userId = req.session.userId;
            const isHelpful = review.helpfulVotes.includes(userId);
            const isUnhelpful = review.unhelpfulVotes.includes(userId);

            if (isHelpful) {
                review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
            } else {
                review.helpfulVotes.push(userId);
                // Remove from unhelpful if it was there
                review.unhelpfulVotes = review.unhelpfulVotes.filter(id => id.toString() !== userId);
            }

            await review.save();
            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Vote failed');
        }
    },

    async toggleUnhelpful(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) return res.status(404).send('Review not found');

            const userId = req.session.userId;
            const isHelpful = review.helpfulVotes.includes(userId);
            const isUnhelpful = review.unhelpfulVotes.includes(userId);

            if (isUnhelpful) {
                review.unhelpfulVotes = review.unhelpfulVotes.filter(id => id.toString() !== userId);
            } else {
                review.unhelpfulVotes.push(userId);
                // Remove from helpful if it was there
                review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
            }

            await review.save();
            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Vote failed');
        }
    }
};

module.exports = reviewController;