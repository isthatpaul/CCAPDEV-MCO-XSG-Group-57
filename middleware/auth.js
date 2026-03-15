// Authentication middleware

const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.render('login', { 
            title: 'Login',
            error: 'You must be logged in to access this page' 
        });
    }
    next();
};

const requireEstablishmentAdmin = async (req, res, next) => {
    const User = require('../model/User');
    
    if (!req.session.userId) {
        return res.render('login', { 
            title: 'Login',
            error: 'You must be logged in to create an establishment' 
        });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if user is an establishment admin or database admin
        if (user.adminType !== 'establishment_admin' && user.adminType !== 'database_admin') {
            return res.render('establishments/index', {
                title: 'Establishments',
                error: 'You do not have permission to create establishments'
            });
        }

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).send('Server error');
    }
};

const requireDatabaseAdmin = async (req, res, next) => {
    const User = require('../model/User');
    
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.adminType !== 'database_admin') {
            return res.status(403).send('You do not have permission to access this resource');
        }

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).send('Server error');
    }
};

module.exports = { requireLogin, requireEstablishmentAdmin, requireDatabaseAdmin };
