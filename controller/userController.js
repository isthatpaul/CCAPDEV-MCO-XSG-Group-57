const User = require('../model/User');
const Review = require('../model/Review');
const cloudinary = require('../config/cloudinary');
const path = require('path');

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
            const updateData = { bio, email, phone };

            // If a file was uploaded, handle image upload to Cloudinary
            if (req.file) {
                try {
                    // Get the current user to get email
                    const user = await User.findById(req.params.id);
                    
                    if (!user) {
                        return res.status(404).send('User not found');
                    }
                    
                    // Generate datetime-based filename
                    const now = new Date();
                    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                                     now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
                    const fileExtension = path.extname(req.file.originalname);
                    const publicId = `${timestamp}${fileExtension}`;

                    // Upload new image to Cloudinary using user email as folder identifier
                    // Old images are kept archived, new ones get datetime filenames
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream({
                            folder: `cloudinary/users/${user.email}/profile_pictures`,
                            public_id: publicId,
                            resource_type: 'auto'
                        }, (error, uploadResult) => {
                            if (error) reject(error);
                            else resolve(uploadResult);
                        }).end(req.file.buffer);
                    });

                    updateData.image = result.secure_url;
                    console.log('✓ New profile picture uploaded:', publicId);
                } catch (cloudinaryErr) {
                    console.error('Cloudinary upload error:', cloudinaryErr);
                    return res.status(500).send('Image upload failed');
                }
            }

            await User.findByIdAndUpdate(req.params.id, updateData);
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
            req.session.adminType = user.adminType;

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

            // Password Match
            if (password !== confirmPassword) {
                return res.render('register', { title: 'Sign Up', error: 'Passwords do not match' });
            }

            // Email format validation check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                return res.render('register', { 
                    title: 'Sign Up', error: 'Invalid email format'
                });
            }

            // Duplicate email check
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
    },

    async deleteProfile(req, res) {
        try {
            // Security check: ensure user can only delete their own account
            if (req.session.userId !== req.params.id) {
                return res.status(403).send('You can only delete your own account');
            }

            const user = await User.findById(req.params.id);
            if (!user) 
                return res.status(404).send('User not found');

            // Delete all user's files and folders from Cloudinary when account is deleted
            try {
                // Delete all resources in the user's cloudinary folder
                await cloudinary.api.delete_resources_by_prefix(`cloudinary/users/${user.email}`);
                console.log('✓ Deleted all Cloudinary resources for user:', user.email);
                
                // Delete the folder and subfolders
                try {
                    // Delete subfolder structures first (profile_pictures, establishment_images, reviews)
                    await cloudinary.api.delete_folder(`cloudinary/users/${user.email}/profile_pictures`).catch(() => {});
                    await cloudinary.api.delete_folder(`cloudinary/users/${user.email}/establishment_images`).catch(() => {});
                    await cloudinary.api.delete_folder(`cloudinary/users/${user.email}/reviews`).catch(() => {});
                    // Delete the main user folder
                    await cloudinary.api.delete_folder(`cloudinary/users/${user.email}`);
                    console.log('✓ Deleted Cloudinary folder structure for user:', user.email);
                } catch (folderErr) {
                    console.warn('Warning: Could not delete empty folders in Cloudinary:', folderErr.message);
                    // Continue anyway - files are already deleted
                }
            } catch (cloudinaryErr) {
                console.error('Error deleting Cloudinary resources:', cloudinaryErr);
                // Continue with user deletion even if folder deletion fails
            }

            // Delete all reviews by this user
            await Review.deleteMany({ userId: req.params.id });

            // Delete the user
            await User.findByIdAndDelete(req.params.id);

            // Destroy session
            req.session.destroy();

            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.status(500).send('Delete failed');
        }
    },

    async changePassword(req, res) {
        try {
            // Security check: ensure user can only change their own password
            if (req.session.userId !== req.params.id) {
                return res.status(403).json({ success: false, message: 'You can only change your own password' });
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
            }

            if (newPassword.length < 4) {
                return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Verify current password
            if (user.password !== currentPassword) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error changing password' });
        }
    },

    async changeName(req, res) {
        try {
            // Security check: ensure user can only change their own name
            if (req.session.userId !== req.params.id) {
                return res.status(403).json({ success: false, message: 'You can only change your own name' });
            }

            const { newName } = req.body;

            if (!newName || !newName.trim()) {
                return res.status(400).json({ success: false, message: 'Please provide a valid name' });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update name
            user.name = newName.trim();
            await user.save();

            // Update session
            req.session.userName = newName.trim();

            res.json({ success: true, message: 'Name changed successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error changing name' });
        }
    }
};

module.exports = userController;