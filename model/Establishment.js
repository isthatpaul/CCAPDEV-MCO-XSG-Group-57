const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    location:    { type: String, required: true },
    contact:     { type: String, default: '' },
    phone:       { type: String, default: '' },
    hours:       { type: String, default: '' },
    link:        { type: String, default: '' },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    category:    { type: String, default: '' },
    admin:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:      { type: Number, default: 0 }
});

module.exports = mongoose.model('Establishment', establishmentSchema);