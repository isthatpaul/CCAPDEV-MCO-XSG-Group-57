const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');

router.get('/', establishmentController.getHome);
router.get('/establishments', establishmentController.getAll);
router.get('/establishments/:id', establishmentController.getOne);
router.post('/establishments/:id/edit', establishmentController.update);

module.exports = router;