require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://angelobarras_db_user:apdev@ccapdev-taftbites.umiueta.mongodb.net/?appName=CCAPDEV-TaftBites')
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
    secret: 'taftbites-secret-key',
    resave: false,
    saveUninitialized: false
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

// Routes
app.use('/', require('./routes/establishments'));
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