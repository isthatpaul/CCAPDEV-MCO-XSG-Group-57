const Review = require('../model/Review');

const reviewController = {
    async create(req, res) {
        try {
            const { title, comment, rating, establishmentId } = req.body;

            await Review.create({
                title,
                comment,
                rating: parseInt(rating),
                userId: req.session.userId,
                establishmentId
            });

            res.redirect('/establishments/' + establishmentId);
        } catch (err) {
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

            await Review.findByIdAndDelete(req.params.id);

            res.redirect('/establishments/' + review.establishmentId);
        } catch (err) {
            res.status(500).send('Delete failed');
        }
    }
};

module.exports = reviewController;