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

    async getManageUsers(req, res) {
        try {
            const users = await User.find().lean();

            res.render('admin/manage-users', {
                title: 'Manage Users',
                users,
                extraCSS: 'establishments.css'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading user management page');
        }
    },

    async createEstablishmentAdmin(req, res) {
        try {
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
            const { adminId } = req.params;

            // Check if trying to delete themselves
            if (adminId === req.session.userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'You cannot delete your own admin account' 
                });
            }

            const admin = await User.findByIdAndDelete(adminId);
            if (!admin || admin.adminType !== 'database_admin') {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Database admin not found' 
                });
            }

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
    },

    async getManageEstablishmentAdmins(req, res) {
        try {
            const establishments = await Establishment.find({}).lean();
            
            const establishmentData = [];
            for (const est of establishments) {
                // Find admin assigned to this establishment
                const assignedAdmin = await User.findOne({ 
                    establishmentsManaged: est._id,
                    adminType: 'establishment_admin'
                }).lean();

                establishmentData.push({
                    ...est,
                    assignedAdmin: assignedAdmin || null
                });
            }

            // Get all establishment admins
            const establishmentAdmins = await User.find({
                adminType: 'establishment_admin'
            }).lean();

            res.render('admin/manage-establishment-admins', {
                title: 'Manage Establishment Admins',
                establishments: establishmentData,
                establishmentAdmins: establishmentAdmins
            });
        } catch (err) {
            console.error('Error getting establishment admins:', err);
            res.status(500).send('Server error');
        }
    },

    async assignEstablishmentAdmin(req, res) {
        try {
            const { establishmentId, adminId } = req.body;

            // Validate inputs
            if (!establishmentId || !adminId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Get the establishment admin
            const admin = await User.findById(adminId);
            if (!admin || admin.adminType !== 'establishment_admin') {
                return res.status(404).json({ success: false, message: 'Admin not found' });
            }

            // Get the establishment
            const establishment = await Establishment.findById(establishmentId);
            if (!establishment) {
                return res.status(404).json({ success: false, message: 'Establishment not found' });
            }

            // Check if admin already manages this establishment
            if (admin.establishmentsManaged.includes(establishmentId)) {
                return res.status(400).json({ success: false, message: 'Admin already assigned to this establishment' });
            }

            // Add establishment to admin's managed list
            admin.establishmentsManaged.push(establishmentId);
            await admin.save();

            res.json({ 
                success: true, 
                message: 'Establishment admin assigned successfully',
                adminName: admin.name
            });
        } catch (err) {
            console.error('Error assigning admin:', err);
            res.status(500).json({ success: false, message: 'Failed to assign admin' });
        }
    },

    async createAndAssignEstablishmentAdmin(req, res) {
        try {
            const { name, email, establishmentId } = req.body;

            // Validate inputs
            if (!name || !email || !establishmentId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            // Check if establishment exists
            const establishment = await Establishment.findById(establishmentId);
            if (!establishment) {
                return res.status(404).json({ success: false, message: 'Establishment not found' });
            }

            // Create new establishment admin
            const newAdmin = new User({
                name,
                email,
                password: 'admin123',
                adminType: 'establishment_admin',
                isAdmin: true,
                establishmentsManaged: [establishmentId]
            });

            await newAdmin.save();

            res.json({ 
                success: true, 
                message: 'Establishment admin created and assigned successfully',
                admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email }
            });
        } catch (err) {
            console.error('Error creating and assigning admin:', err);
            res.status(500).json({ success: false, message: 'Failed to create and assign admin' });
        }
    },

    async removeEstablishmentAdmin(req, res) {
        try {
            const { adminId, establishmentId } = req.body;

            // Get the admin
            const admin = await User.findById(adminId);
            if (!admin) {
                return res.status(404).json({ success: false, message: 'Admin not found' });
            }

            // Remove establishment from admin's managed list
            admin.establishmentsManaged = admin.establishmentsManaged.filter(
                id => id.toString() !== establishmentId
            );
            await admin.save();

            res.json({ 
                success: true, 
                message: 'Admin removed from establishment successfully'
            });
        } catch (err) {
            console.error('Error removing admin:', err);
            res.status(500).json({ success: false, message: 'Failed to remove admin' });
        }
    },

    async updateUser(req, res) {
        try {
            const { name, email, phone, bio } = req.body;
            const userId = req.params.userId;

            // Validate inputs
            if (!name || !email) {
                return res.status(400).json({ success: false, message: 'Name and email are required' });
            }

            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            // Update user
            await User.findByIdAndUpdate(userId, {
                name,
                email,
                phone: phone || '',
                bio: bio || ''
            });

            res.json({ success: true, message: 'User updated successfully' });
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ success: false, message: 'Failed to update user' });
        }
    },

    async deleteUser(req, res) {
        try {
            const userId = req.params.userId;

            // Prevent deleting the current logged in user
            if (userId === req.session.userId) {
                return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
            }

            // Delete all reviews by this user
            await Review.deleteMany({ userId });

            // Delete the user
            await User.findByIdAndDelete(userId);

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ success: false, message: 'Failed to delete user' });
        }
    }
};

module.exports = adminController;
