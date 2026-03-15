const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const upload = require('../config/multer');

router.post('/', upload.multiple.array('images', 5), reviewController.create);
router.post('/:id/reply', reviewController.addReply);
router.post('/:id/reply/delete', reviewController.deleteReply);
router.post('/:id/edit', reviewController.update);
router.post('/:id/delete', reviewController.delete);
router.post('/:id/helpful', reviewController.toggleHelpful);
router.post('/:id/unhelpful', reviewController.toggleUnhelpful);

module.exports = router;