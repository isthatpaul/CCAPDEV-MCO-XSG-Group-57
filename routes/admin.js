const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { requireLogin, requireDatabaseAdmin } = require('../middleware/auth');

// All admin routes require a logged-in user
router.use(requireLogin);

// Dashboard is accessible to all logged-in admin types
router.get('/dashboard', adminController.getDashboard);

// All routes below also require database admin role
router.use(requireDatabaseAdmin);

router.get('/manage-users', adminController.getManageUsers);
router.get('/manage-establishment-admins', adminController.getManageEstablishmentAdmins);
router.get('/database-admins', adminController.getManageDatabaseAdmins);
router.post('/users/:userId/update', adminController.updateUser);
router.post('/users/:userId/delete', adminController.deleteUser);
router.post('/create-admin', adminController.createEstablishmentAdmin);
router.post('/assign-establishment-admin', adminController.assignEstablishmentAdmin);
router.post('/create-and-assign-establishment-admin', adminController.createAndAssignEstablishmentAdmin);
router.post('/remove-establishment-admin', adminController.removeEstablishmentAdmin);
router.post('/create-database-admin', adminController.createDatabaseAdmin);
router.delete('/delete-admin/:adminId', adminController.deleteEstablishmentAdmin);
router.delete('/delete-database-admin/:adminId', adminController.deleteDatabaseAdmin);

module.exports = router;
