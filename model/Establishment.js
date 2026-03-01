const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    location:    { type: String, required: true },
    contact:     { type: String, default: '' },
    hours:       { type: String, default: '' },
    link:        { type: String, default: '' },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    rating:      { type: Number, default: 0 }
});

module.exports = mongoose.model('Establishment', establishmentSchema);