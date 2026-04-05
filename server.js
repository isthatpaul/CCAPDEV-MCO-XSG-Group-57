require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongo').default;
const path = require('path');
const { formatTime, formatDayHours, formatAllHours } = require('./utils/businessHelpers');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Handlebars setup
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        stars: function(rating) {
            const full = '★'.repeat(Math.floor(rating));
            const empty = '☆'.repeat(5 - Math.floor(rating));
            return full + empty;
        },
        eq: function(a, b) {
            return a?.toString() === b?.toString();
        },
        ne: function(a, b) {
            return a?.toString() !== b?.toString();
        },
        formatDate: function(date) {
            if (!date) return 'Unknown';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
        },
        initials: function(name) {
            if (!name) return '?';
            return name.split(' ').map(w => w[0]).join('').toUpperCase();
        },
        unless_eq: function(a, b, options) {
            if (a?.toString() !== b?.toString()) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        imageUrl: function(imagePath) {
            if (imagePath && imagePath.startsWith('http')) {
                return imagePath; // It's a Cloudinary URL
            }
            return '/images/' + imagePath; // It's a local filename
        },
        formatPhone: function(phone) {
            if (!phone) return '';
            // Format as (XXX) XXX-XXXX
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
            }
            return phone;
        },
        pluralize: function(count, singular, plural) {
            return count === 1 ? singular : plural;
        },
        ratingPercentage: function(count, total) {
            if (total === 0) return 0;
            return Math.round((count / total) * 100);
        },
        json: function(obj) {
            return JSON.stringify(obj);
        },
        formatTime: function(timeStr) {
            return formatTime(timeStr);
        },
        formatDayHours: function(dayHours) {
            return formatDayHours(dayHours);
        },
        formatAllHours: function(hoursArray) {
            return formatAllHours(hoursArray);
        },
        getHoursByDay: function(hoursArray, dayOfWeek) {
            if (!hoursArray || hoursArray.length === 0) return {};
            return hoursArray.find(h => h.dayOfWeek === dayOfWeek) || {};
        },
        statusColor: function(status) {
            if (status === 'open') return '#4CAF50';
            if (status === 'closing') return '#FF9800';
            return '#f44336';
        },
        statusEmoji: function(status) {
            if (status === 'open') return '🟢';
            if (status === 'closing') return '⏰';
            return '🔴';
        },
        statusLabel: function(status) {
            if (status === 'open') return 'Open';
            if (status === 'closing') return 'Closing';
            return 'Closed';
        }
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ 
        mongoUrl: process.env.MONGO_URL
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Make session data available in ALL views
app.use((req, res, next) => {
    res.locals.currentUserId = req.session.userId || null;
    res.locals.currentUserName = req.session.userName || null;
    res.locals.isAdmin = req.session.isAdmin || false;
    res.locals.adminType = req.session.adminType || 'user';
    res.locals.isLoggedIn = !!req.session.userId;
    next();
});

// About Page Route
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About TaftBites'
    });
});

// Routes
app.use('/', require('./routes/establishments'));
app.use('/admin', require('./routes/admin'));
app.use('/users', require('./routes/users'));
app.use('/reviews', require('./routes/reviews'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('index', {
        title: 'Page Not Found',
        establishments: [],
        reviews: [],
        error: 'Page not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`TaftBites running at http://localhost:${PORT}`);
});