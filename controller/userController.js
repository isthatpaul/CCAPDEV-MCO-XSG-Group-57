const User = require('../model/User');
const Review = require('../model/Review');

const userController = {
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.params.id).lean();
            if (!user) return res.status(404).send('User not found');

            const reviews = await Review.find({ userId: user._id })
                .populate('establishmentId')
                .lean();

            const isOwnProfile = req.session.userId === user._id.toString();

            res.render('users/show', {
                title: user.name + "'s Profile",
                user,
                reviews,
                isOwnProfile,
                extraCSS: 'Profile.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    },

    async updateProfile(req, res) {
        try {
            const { bio, email, phone } = req.body;
            await User.findByIdAndUpdate(req.params.id, { bio, email, phone });
            res.redirect('/users/' + req.params.id);
        } catch (err) {
            console.error(err);
            res.status(500).send('Update failed');
        }
    },

    getLogin(req, res) {
        res.render('login', { title: 'Login' });
    },

    async postLogin(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email, password }).lean();

            if (!user) {
                return res.render('login', { title: 'Login', error: 'Invalid email or password' });
            }

            req.session.userId = user._id.toString();
            req.session.userName = user.name;
            req.session.isAdmin = user.isAdmin;

            if (user.isAdmin && user.establishmentsManaged && user.establishmentsManaged.length > 0) {
                res.redirect('/establishments/' + user.establishmentsManaged[0]);
            } else {
                res.redirect('/users/' + user._id);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Login failed');
        }
    },

    getRegister(req, res) {
        res.render('register', { title: 'Sign Up' });
    },

    async postRegister(req, res) {
        try {
            const { name, email, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.render('register', { title: 'Sign Up', error: 'Passwords do not match' });
            }

            const existing = await User.findOne({ email });
            if (existing) {
                return res.render('register', { title: 'Sign Up', error: 'Email already registered' });
            }

            const user = await User.create({ name, email, password });

            req.session.userId = user._id.toString();
            req.session.userName = user.name;

            res.redirect('/users/' + user._id);
        } catch (err) {
            console.error(err);
            res.status(500).send('Registration failed');
        }
    },

    logout(req, res) {
        req.session.destroy();
        res.redirect('/');
    }
};

module.exports = userController;