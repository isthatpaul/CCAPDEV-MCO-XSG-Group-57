const multer = require('multer');
const path = require('path');

// Set up storage for temporary files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filter for image files only (for profile pictures)
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Filter for images and videos (for reviews)
const mediaFileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedVideoTypes = /mp4|avi|mov|mkv|webm/;
    const extname = path.extname(file.originalname).toLowerCase().substring(1);
    const isImage = allowedImageTypes.test(file.mimetype);
    const isVideo = allowedVideoTypes.test(file.mimetype) || allowedVideoTypes.test(extname);

    if (isImage || isVideo) {
        return cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

const uploadSingle = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadMultiple = multer({
    storage: storage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

module.exports = uploadSingle;
module.exports.single = uploadSingle;
module.exports.multiple = uploadMultiple;
