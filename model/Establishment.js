const mongoose = require('mongoose');

const hoursSchema = new mongoose.Schema({
    dayOfWeek: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
    openTime:  { type: String, required: true }, // "07:00" (24-hour format)
    closeTime: { type: String, required: true }, // "21:00"
    isClosed:  { type: Boolean, default: false }
});

const establishmentSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    location:    { type: String, required: true },
    contact:     { type: String, default: '' },
    phone:       { type: String, default: '' },
    hours:       [hoursSchema], // Array of hours for each day of the week
    link:        { type: String, default: '' },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    category:    { type: String, default: '' },
    admin:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:      { type: Number, default: 0 }
});

// Helper method to get hours for a specific day
establishmentSchema.methods.getHoursForDay = function(dayOfWeek) {
    return this.hours.find(h => h.dayOfWeek === dayOfWeek) || null;
};

// Helper method to get today's hours
establishmentSchema.methods.getTodayHours = function() {
    const today = new Date().getDay();
    return this.getHoursForDay(today);
};

// Helper method to check if open at specific time
establishmentSchema.methods.isOpenAtTime = function(hour, minute, dayOfWeek) {
    const dayHours = this.getHoursForDay(dayOfWeek);
    if (!dayHours || dayHours.isClosed) return false;
    
    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    return timeInMinutes >= (openH * 60 + openM) && timeInMinutes < (closeH * 60 + closeM);
};

module.exports = mongoose.model('Establishment', establishmentSchema);