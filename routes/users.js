const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const favoritesController = require('../controller/favoritesController');
const upload = require('../config/multer');
const { requireLogin } = require('../middleware/auth');

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);
router.get('/logout', userController.logout);
router.get('/:userId/favorites', favoritesController.getFavorites);
router.get('/:id', userController.getProfile);
router.post('/:id/edit', upload.single('picture'), userController.updateProfile);
router.post('/:id/delete', requireLogin, userController.deleteProfile);

module.exports = router;