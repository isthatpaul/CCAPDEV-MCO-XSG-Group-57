const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');

router.post('/', reviewController.create);
router.post('/:id/edit', reviewController.update);
router.post('/:id/delete', reviewController.delete);

module.exports = router;