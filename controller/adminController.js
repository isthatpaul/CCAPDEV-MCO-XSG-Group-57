const User = require('../model/User');
const Establishment = require('../model/Establishment');
const Review = require('../model/Review');

const adminController = {
    async getDashboard(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const user = await User.findById(req.session.userId).lean();
            if (!user || !user.isAdmin) {
                return res.status(403).send('Not authorized');
            }

            // Get all managed establishments with stats
            const establishments = await Establishment.find({
                _id: { $in: user.establishmentsManaged }
            }).lean();

            const stats = [];

            for (const est of establishments) {
                const reviews = await Review.find({ establishmentId: est._id }).lean();
                
                const avgRating = reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
                    : 'N/A';

                const totalHelpful = reviews.reduce((sum, r) => sum + (r.helpfulVotes?.length || 0), 0);
                
                // Get recent reviews (last 7 days)
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const recentReviews = reviews.filter(r => new Date(r.createdAt) > sevenDaysAgo);

                stats.push({
                    establishment: est,
                    totalReviews: reviews.length,
                    avgRating: avgRating,
                    totalHelpful: totalHelpful,
                    recentReviews: recentReviews.length,
                    reviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                });
            }

            // Get all establishments and users (for database admin)
            let allEstablishments = [];
            let allUsers = [];
            let isDatabaseAdmin = false;

            if (user.adminType === 'database_admin') {
                isDatabaseAdmin = true;
                allEstablishments = await Establishment.find().lean();
                allUsers = await User.find({ adminType: 'establishment_admin' }).lean();
            }

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats,
                userName: user.name,
                userAdminType: user.adminType,
                isDatabaseAdmin,
                allEstablishments,
                allUsers,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading dashboard');
        }
    },

    async getAdminManagement(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const user = await User.findById(req.session.userId)
                .populate('linkedEstablishment')
                .lean();
            
            if (!user || user.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can access this page');
            }

            const allEstablishments = await Establishment.find()
                .populate('admin', 'name email')
                .lean();
            
            const establishmentAdmins = await User.find({ adminType: 'establishment_admin' })
                .populate('linkedEstablishment', 'name')
                .lean();

            res.render('admin/manage-admins', {
                title: 'Manage Establishment Admins',
                establishments: allEstablishments,
                admins: establishmentAdmins,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading admin management page');
        }
    },

    async createEstablishmentAdmin(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const databaseAdmin = await User.findById(req.session.userId);
            if (!databaseAdmin || databaseAdmin.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can create establishment admins');
            }

            const { name, email, password, establishmentId } = req.body;

            // Validate inputs
            if (!name || !email || !password || !establishmentId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already exists' 
                });
            }

            // Verify establishment exists
            const establishment = await Establishment.findById(establishmentId);
            if (!establishment) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Establishment not found' 
                });
            }

            // Create the establishment admin user
            const newAdmin = await User.create({
                name,
                email,
                password,
                isAdmin: true,
                adminType: 'establishment_admin',
                linkedEstablishment: establishmentId,
                establishmentsManaged: [establishmentId]
            });

            // Update establishment's admin field
            establishment.admin = newAdmin._id;
            await establishment.save();

            res.status(201).json({ 
                success: true, 
                message: 'Establishment admin created successfully',
                admin: newAdmin
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to create establishment admin' 
            });
        }
    },

    async deleteEstablishmentAdmin(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const databaseAdmin = await User.findById(req.session.userId);
            if (!databaseAdmin || databaseAdmin.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can delete establishment admins');
            }

            const { adminId } = req.params;

            const admin = await User.findById(adminId);
            if (!admin || admin.adminType !== 'establishment_admin') {
                return res.status(404).send('Admin not found');
            }

            // Remove admin from all managed establishments
            await Establishment.updateMany(
                { admin: adminId },
                { admin: null }
            );

            // Delete the admin user
            await User.findByIdAndDelete(adminId);

            res.status(200).json({ 
                success: true, 
                message: 'Establishment admin deleted successfully' 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to delete establishment admin' 
            });
        }
    },

    async getManageDatabaseAdmins(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const currentAdmin = await User.findById(req.session.userId);
            if (!currentAdmin || currentAdmin.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can access this page');
            }

            const databaseAdmins = await User.find({ adminType: 'database_admin' }).lean();

            res.render('admin/manage-database-admins', {
                title: 'Manage Database Admins',
                admins: databaseAdmins,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading database admin management page');
        }
    },

    async createDatabaseAdmin(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const currentAdmin = await User.findById(req.session.userId);
            if (!currentAdmin || currentAdmin.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can create other database admins');
            }

            const { name, email, password } = req.body;

            // Validate inputs
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            // Validate password length
            if (password.length < 4) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 4 characters' 
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already exists' 
                });
            }

            // Create the database admin user
            const newAdmin = await User.create({
                name,
                email,
                password,
                isAdmin: true,
                adminType: 'database_admin'
            });

            res.status(201).json({ 
                success: true, 
                message: 'Database admin created successfully',
                admin: newAdmin
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to create database admin' 
            });
        }
    },

    async deleteDatabaseAdmin(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).send('Not logged in');
            }

            const currentAdmin = await User.findById(req.session.userId);
            if (!currentAdmin || currentAdmin.adminType !== 'database_admin') {
                return res.status(403).send('Only database admins can delete other database admins');
            }

            const { adminId } = req.params;

            // Check if trying to delete themselves
            if (adminId === req.session.userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'You cannot delete your own admin account' 
                });
            }

            const admin = await User.findById(adminId);
            if (!admin || admin.adminType !== 'database_admin') {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Database admin not found' 
                });
            }

            // Delete the admin user
            await User.findByIdAndDelete(adminId);

            res.status(200).json({ 
                success: true, 
                message: 'Database admin deleted successfully' 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to delete database admin' 
            });
        }
    }
};

module.exports = adminController;
