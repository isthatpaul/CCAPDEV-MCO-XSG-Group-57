const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');
const adminController = require('../controller/adminController');
const favoritesController = require('../controller/favoritesController');
const upload = require('../config/multer');
const { requireLogin, requireEstablishmentAdmin, requireDatabaseAdmin } = require('../middleware/auth');

router.get('/', establishmentController.getHome);
router.get('/admin/dashboard', requireLogin, adminController.getDashboard);
router.get('/admin/manage-admins', requireLogin, requireDatabaseAdmin, adminController.getAdminManagement);
router.get('/admin/database-admins', requireLogin, requireDatabaseAdmin, adminController.getManageDatabaseAdmins);
router.post('/admin/create-admin', requireLogin, requireDatabaseAdmin, adminController.createEstablishmentAdmin);
router.post('/admin/create-database-admin', requireLogin, requireDatabaseAdmin, adminController.createDatabaseAdmin);
router.delete('/admin/delete-admin/:adminId', requireLogin, requireDatabaseAdmin, adminController.deleteEstablishmentAdmin);
router.delete('/admin/delete-database-admin/:adminId', requireLogin, requireDatabaseAdmin, adminController.deleteDatabaseAdmin);
router.get('/establishments', establishmentController.getAll);
router.get('/establishments/new', requireLogin, requireEstablishmentAdmin, establishmentController.getCreateForm);
router.post('/establishments', requireLogin, requireEstablishmentAdmin, upload.single('image'), establishmentController.create);
router.get('/establishments/:id', establishmentController.getOne);
router.post('/establishments/:id/edit', establishmentController.update);
router.post('/establishments/:id/delete', establishmentController.delete);
router.post('/establishments/:id/favorites/toggle', favoritesController.toggleFavorite);

module.exports = router;