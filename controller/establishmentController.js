const Establishment = require('../model/Establishment');
const Review = require('../model/Review');
const User = require('../model/User');

const establishmentController = {
    async getHome(req, res) {
        try {
            const establishments = await Establishment.find().limit(3).lean();

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
            let establishments;

            if (query) {
                establishments = await Establishment.find({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { location: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                }).lean();
            } else {
                establishments = await Establishment.find().lean();
            }

            res.render('establishments/index', {
                title: 'Establishments',
                establishments,
                query,
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

            const reviews = await Review.find({ establishmentId: establishment._id })
                .populate('userId', 'name')
                .sort({ createdAt: -1 })
                .lean();

            let canEdit = false;
            if (req.session.userId) {
                const user = await User.findById(req.session.userId).lean();
                if (user && user.isAdmin) {
                    const managedIds = user.establishmentsManaged.map(id => id.toString());
                    if (managedIds.includes(establishment._id.toString())) {
                        canEdit = true;
                    }
                }
            }

            res.render('establishments/show', {
                title: establishment.name,
                establishment,
                reviews,
                canEdit,
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
            const { location, contact, hours, link, description } = req.body;
            await Establishment.findByIdAndUpdate(req.params.id, {
                location, contact, hours, link, description
            });
            res.redirect('/establishments/' + req.params.id);
        } catch (err) {
            console.error('Update error:', err);
            res.status(500).send('Update failed');
        }
    },

    async create(req, res) {
        try {
            const { name, location, contact, hours, link, description, image } = req.body;

            const establishment = await Establishment.create({
                name,
                location,
                contact: contact || '',
                hours: hours || '',
                link: link || '',
                description: description || '',
                image: image || ''
            });

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