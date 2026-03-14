const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');

router.get('/', establishmentController.getHome);
router.get('/establishments', establishmentController.getAll);
router.post('/establishments', establishmentController.create);
router.get('/establishments/:id', establishmentController.getOne);
router.post('/establishments/:id/edit', establishmentController.update);
router.post('/establishments/:id/delete', establishmentController.delete);

module.exports = router;