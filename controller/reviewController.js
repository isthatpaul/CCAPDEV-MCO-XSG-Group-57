const Review = require('../model/Review');
const User = require('../model/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { updateEstablishmentRating } = require('../utils/businessHelpers');

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

            // Get user to access their email for folder structure
            const reviewUser = await User.findById(req.session.userId);
            if (!reviewUser) {
                return res.status(401).send('User not found');
            }

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
                        // Upload using buffer from memory storage with user email as identifier
                        const uploadResult = await new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_stream({
                                folder: `cloudinary/users/${reviewUser.email}/reviews/${establishmentId}`,
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
            
            // Update establishment rating
            await updateEstablishmentRating(establishmentId);

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

            
            // Update establishment rating
            await updateEstablishmentRating(review.establishmentId);
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
            
            // Update establishment rating
            await updateEstablishmentRating(review.establishmentId);
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
            const user = await User.findById(userId);
            const isHelpful = review.helpfulVotes.some(id => id.toString() === userId);
            const isUnhelpful = review.unhelpfulVotes.some(id => id.toString() === userId);

            if (isHelpful) {
                review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
                user.helpfulReviewVotes = user.helpfulReviewVotes.filter(id => id.toString() !== req.params.id);
            } else {
                review.helpfulVotes.push(userId);
                user.helpfulReviewVotes = user.helpfulReviewVotes.filter(id => id.toString() !== req.params.id);
                user.helpfulReviewVotes.push(req.params.id);
                // Remove from unhelpful if it was there
                review.unhelpfulVotes = review.unhelpfulVotes.filter(id => id.toString() !== userId);
                user.unhelpfulReviewVotes = user.unhelpfulReviewVotes.filter(id => id.toString() !== req.params.id);
            }

            await review.save();
            await user.save();
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
            const user = await User.findById(userId);
            const isHelpful = review.helpfulVotes.some(id => id.toString() === userId);
            const isUnhelpful = review.unhelpfulVotes.some(id => id.toString() === userId);

            if (isUnhelpful) {
                review.unhelpfulVotes = review.unhelpfulVotes.filter(id => id.toString() !== userId);
                user.unhelpfulReviewVotes = user.unhelpfulReviewVotes.filter(id => id.toString() !== req.params.id);
            } else {
                review.unhelpfulVotes.push(userId);
                user.unhelpfulReviewVotes = user.unhelpfulReviewVotes.filter(id => id.toString() !== req.params.id);
                user.unhelpfulReviewVotes.push(req.params.id);
                // Remove from helpful if it was there
                review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
                user.helpfulReviewVotes = user.helpfulReviewVotes.filter(id => id.toString() !== req.params.id);
            }

            await review.save();
            await user.save();
            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Vote failed');
        }
    },

    async addReply(req, res) {
        console.log("POST request received for ID:", req.params.id);
        try {
            const { comment } = req.body;
            const review = await Review.findById(req.params.id);
            
            if (!review) return res.status(404).send('Review not found');

            review.ownerReply = {
                comment,
                createdAt: new Date()
            };

            await review.save();
            res.redirect(`/establishments/${review.establishmentId}`);
        } catch (err) {
            res.status(500).send('Failed to add reply');
        }
    },

    async deleteReply(req, res) {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).send('Review not found');

        // Remove the ownerReply field
        await Review.findByIdAndUpdate(req.params.id, {
            $unset: { ownerReply: "" }
        });

        res.redirect(`/establishments/${review.establishmentId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete reply');
    }
}
};

module.exports = reviewController;