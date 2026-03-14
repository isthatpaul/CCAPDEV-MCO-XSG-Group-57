const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);
router.get('/logout', userController.logout);
router.get('/:id', userController.getProfile);
router.post('/:id/edit', userController.updateProfile);
router.post('/:id/delete', userController.deleteProfile);

module.exports = router;