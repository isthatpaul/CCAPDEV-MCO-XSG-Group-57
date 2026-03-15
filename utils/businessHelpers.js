// Helper functions for business hours and recommendations

const parseHours = (hoursStr) => {
    // Parse format like "7:00 AM - 9:00 PM" or "24/7"
    if (!hoursStr || hoursStr === '24/7') {
        return { open: 0, close: 24 };
    }

    try {
        const [openStr, closeStr] = hoursStr.split('-').map(s => s.trim());
        
        const parseTime = (timeStr) => {
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return null;
            
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const meridiem = match[3].toUpperCase();
            
            if (meridiem === 'PM' && hours !== 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            
            return hours + minutes / 60;
        };

        const open = parseTime(openStr);
        const close = parseTime(closeStr);

        return { open, close };
    } catch (err) {
        return null;
    }
};

const getBusinessStatus = (hoursStr) => {
    // Get current time in Manila (UTC+8)
    const now = new Date();
    const manilaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentHour = manilaTime.getHours() + manilaTime.getMinutes() / 60;

    const hours = parseHours(hoursStr);
    if (!hours) return { status: 'unknown', message: 'Hours not specified' };

    const isOpen = currentHour >= hours.open && currentHour < hours.close;
    const timeUntilClose = hours.close - currentHour;
    const timeUntilOpen = hours.open - currentHour;

    if (isOpen) {
        if (timeUntilClose < 1) {
            return { status: 'closing', message: `Closing in ${Math.round(timeUntilClose * 60)} mins` };
        }
        return { status: 'open', message: 'Open now' };
    } else {
        const nextOpen = timeUntilOpen > 0 ? timeUntilOpen : 24 + timeUntilOpen;
        return { status: 'closed', message: `Opens in ${Math.round(nextOpen * 60)} mins` };
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

module.exports = {
    parseHours,
    getBusinessStatus,
    getRecommendations
};
