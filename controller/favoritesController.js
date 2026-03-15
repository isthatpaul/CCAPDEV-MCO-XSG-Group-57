const User = require('../model/User');
const Establishment = require('../model/Establishment');

const favoritesController = {
    async toggleFavorite(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const user = await User.findById(req.session.userId);
            if (!user) return res.status(404).send('User not found');

            // Initialize favorites if it doesn't exist
            if (!user.favorites) {
                user.favorites = [];
            }

            const estabId = req.params.id;
            const isFavorited = user.favorites.includes(estabId);

            if (isFavorited) {
                user.favorites = user.favorites.filter(id => id.toString() !== estabId);
            } else {
                user.favorites.push(estabId);
            }

            await user.save();
            res.redirect('/establishments/' + estabId);
        } catch (err) {
            console.error(err);
            res.status(500).send('Toggle favorite failed');
        }
    },

    async getFavorites(req, res) {
        try {
            const user = await User.findById(req.params.userId)
                .populate('favorites')
                .lean();

            if (!user) return res.status(404).send('User not found');

            const isOwnFavorites = req.session.userId === req.params.userId;

            res.render('users/favorites', {
                title: user.name + "'s Favorites",
                user,
                favorites: user.favorites,
                isOwnFavorites,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading favorites');
        }
    }
};

module.exports = favoritesController;
