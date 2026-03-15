const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');
const favoritesController = require('../controller/favoritesController');
const upload = require('../config/multer');
const { requireLogin, requireEstablishmentAdmin } = require('../middleware/auth');

router.get('/', establishmentController.getHome);
router.get('/establishments', establishmentController.getAll);
router.get('/establishments/new', requireLogin, requireEstablishmentAdmin, establishmentController.getCreateForm);
router.post('/establishments', requireLogin, requireEstablishmentAdmin, upload.single('image'), establishmentController.create);
router.get('/establishments/:id', establishmentController.getOne);
router.post('/establishments/:id/edit', requireLogin, upload.single('image'), establishmentController.update);
router.post('/establishments/:id/delete', requireLogin, establishmentController.delete);
router.post('/establishments/:id/favorites/toggle', requireLogin, favoritesController.toggleFavorite);

module.exports = router;