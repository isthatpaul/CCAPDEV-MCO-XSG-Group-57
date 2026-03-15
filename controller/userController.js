const User = require('../model/User');
const Review = require('../model/Review');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url) {
    if (!url || !url.startsWith('https://res.cloudinary.com')) {
        return null;
    }
    try {
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.ext
        // We need: folder/filename (without extension)
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        const pathParts = parts[1].split('/');
        // Remove version number if present (v123456)
        let startIdx = pathParts[0].startsWith('v') ? 1 : 0;
        
        // Join remaining parts and remove file extension
        const publicId = pathParts.slice(startIdx).join('/');
        return publicId.split('.')[0]; // Remove file extension
    } catch (err) {
        console.error('Error extracting public_id:', err);
        return null;
    }
}

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
    },

    async deleteProfile(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) 
                return res.status(404).send('User not found');

            // Delete all user's files from Cloudinary folder when account is deleted
            try {
                // Delete all resources in the user's cloudinary folder
                await cloudinary.api.delete_resources_by_prefix(`cloudinary/users/${user.email}`);
                console.log('✓ Deleted all Cloudinary resources for user:', user.email);
            } catch (cloudinaryErr) {
                console.error('Error deleting Cloudinary resources:', cloudinaryErr);
                // Continue with user deletion even if folder deletion fails
            }

            // Delete all reviews by this user
            await Review.deleteMany({ userId: req.params.id });

            // Delete the user
            await User.findByIdAndDelete(req.params.id);

            // Destroy session if it's their own profile
            if (req.session.userId === req.params.id) {
                req.session.destroy();
            }

            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.status(500).send('Delete failed');
        }
    }
};

module.exports = userController;