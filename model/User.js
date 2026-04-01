const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 4 },
    joinDate: { type: Date, default: Date.now },
    bio:      { type: String, default: 'New member of TaftBites!' },
    phone:    { type: String, default: '' },
    image:    { type: String, default: 'sample_profile.jpg' },
    isAdmin:  { type: Boolean, default: false },
    adminType: { 
        type: String, 
        enum: ['user', 'establishment_admin', 'database_admin'], 
        default: 'user' 
    },
    linkedEstablishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', default: null },
    establishmentsManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' }],
    favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'Establishment', default: [] },
    helpfulReviewVotes: { type: [mongoose.Schema.Types.ObjectId], ref: 'Review', default: [] },
    unhelpfulReviewVotes: { type: [mongoose.Schema.Types.ObjectId], ref: 'Review', default: [] }
});

// Password Hashing
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return; 

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

module.exports = mongoose.model('User', userSchema);