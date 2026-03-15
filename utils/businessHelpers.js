// Helper functions for business hours and recommendations

const parseHours = (hoursArray) => {
    // Parse structured hours array for current day
    if (!hoursArray || hoursArray.length === 0) {
        return null;
    }

    const now = new Date();
    const manilaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentDayOfWeek = manilaTime.getDay();

    const todayHours = hoursArray.find(h => h.dayOfWeek === currentDayOfWeek);
    if (!todayHours || todayHours.isClosed) {
        return null;
    }

    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
    };

    return {
        open: parseTime(todayHours.openTime),
        close: parseTime(todayHours.closeTime),
        dayHours: todayHours
    };
};

const getBusinessStatus = (hoursArray) => {
    // Get current time in Manila (UTC+8)
    const now = new Date();
    const manilaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentHour = manilaTime.getHours() + manilaTime.getMinutes() / 60;
    const currentDayOfWeek = manilaTime.getDay();

    const hours = parseHours(hoursArray);
    if (!hours) return { status: 'closed', message: 'Closed today' };

    const isOpen = currentHour >= hours.open && currentHour < hours.close;
    const timeUntilClose = hours.close - currentHour;
    const timeUntilOpen = hours.open - currentHour;

    if (isOpen) {
        if (timeUntilClose < 1) {
            return { status: 'closing', message: `Closing in ${Math.round(timeUntilClose * 60)} mins` };
        }
        return { status: 'open', message: 'Open now' };
    } else {
        // Find next opening time
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let nextDayOffset = 0;
        let nextDayHours = null;
        
        // Search for next open day
        for (let i = 1; i <= 7; i++) {
            const searchDay = (currentDayOfWeek + i) % 7;
            const dayHours = hoursArray.find(h => h.dayOfWeek === searchDay);
            if (dayHours && !dayHours.isClosed) {
                nextDayOffset = i;
                nextDayHours = dayHours;
                break;
            }
        }
        
        if (!nextDayHours) {
            return { status: 'closed', message: 'No opening hours found' };
        }
        
        const nextDay = (currentDayOfWeek + nextDayOffset) % 7;
        const timeStr = formatTime(nextDayHours.openTime);
        const dayStr = nextDayOffset === 0 ? 'today' : (nextDayOffset === 1 ? 'tomorrow' : dayNames[nextDay]);
        
        return { status: 'closed', message: `Opens at ${timeStr}` };
    }
};

const getRecommendations = (establishment, allEstablishments, limit = 3) => {
    // Get similar establishments based on rating range and location
    const ratingTolerance = 0.5;
    const minRating = establishment.rating - ratingTolerance;
    const maxRating = establishment.rating + ratingTolerance;

    const recommendations = allEstablishments
        .filter(est => 
            est._id.toString() !== establishment._id.toString() &&
            est.rating >= minRating && 
            est.rating <= maxRating &&
            est.location === establishment.location
        )
        .sort((a, b) => Math.abs(b.rating - establishment.rating) - Math.abs(a.rating - establishment.rating))
        .slice(0, limit);

    // If not enough similar in same location, expand to any location with similar rating
    if (recommendations.length < limit) {
        const moreRecs = allEstablishments
            .filter(est => 
                est._id.toString() !== establishment._id.toString() &&
                !recommendations.find(r => r._id.toString() === est._id.toString()) &&
                est.rating >= minRating && 
                est.rating <= maxRating
            )
            .sort((a, b) => Math.abs(b.rating - establishment.rating) - Math.abs(a.rating - establishment.rating))
            .slice(0, limit - recommendations.length);
        
        recommendations.push(...moreRecs);
    }

    return recommendations;
};

const updateEstablishmentRating = async (establishmentId) => {
    const Review = require('../model/Review');
    const Establishment = require('../model/Establishment');
    
    try {
        const reviews = await Review.find({ establishmentId }).lean();
        
        if (reviews.length === 0) {
            // No reviews, set rating to 0
            await Establishment.findByIdAndUpdate(establishmentId, { rating: 0 });
        } else {
            // Calculate average rating
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
            const roundedRating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
            
            await Establishment.findByIdAndUpdate(establishmentId, { rating: roundedRating });
        }
    } catch (err) {
        console.error('Error updating establishment rating:', err);
    }
};

// Helper function to convert 24-hour time to 12-hour format
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
};

// Helper function to format hours for a single day
const formatDayHours = (dayHours) => {
    if (!dayHours || dayHours.isClosed) {
        return 'Closed';
    }
    return `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}`;
};

// Helper function to format all hours for display
const formatAllHours = (hoursArray) => {
    if (!hoursArray || hoursArray.length === 0) {
        return 'Hours not specified';
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hoursByDay = {};
    
    hoursArray.forEach(h => {
        hoursByDay[h.dayOfWeek] = h;
    });

    // Group consecutive days with same hours
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < 7; i++) {
        const dayHours = hoursByDay[i];
        const hoursStr = formatDayHours(dayHours);

        if (currentGroup && currentGroup.hours === hoursStr) {
            currentGroup.days.push(dayNames[i]);
        } else {
            if (currentGroup) groups.push(currentGroup);
            currentGroup = { days: [dayNames[i]], hours: hoursStr };
        }
    }
    if (currentGroup) groups.push(currentGroup);

    // Format as "Mon-Fri 9:00 AM - 5:00 PM, Sat-Sun 10:00 AM - 4:00 PM"
    return groups.map(g => {
        const dayRange = g.days.length === 1 
            ? g.days[0] 
            : `${g.days[0]}-${g.days[g.days.length - 1]}`;
        return `${dayRange} ${g.hours}`;
    }).join(', ');
};

module.exports = {
    parseHours,
    getBusinessStatus,
    getRecommendations,
    updateEstablishmentRating,
    formatTime,
    formatDayHours,
    formatAllHours
};
