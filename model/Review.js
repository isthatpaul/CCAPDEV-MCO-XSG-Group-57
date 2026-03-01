const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    title:           { type: String, required: true },
    comment:         { type: String, default: '' },
    rating:          { type: Number, required: true, min: 1, max: 5 },
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    establishmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
    createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);