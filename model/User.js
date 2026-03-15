const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);