const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dhaga_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dhaga_reels',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'webm'],
    },
});

const upload = multer({ storage: storage });
const uploadVideo = multer({ storage: videoStorage });


// @route POST /api/upload
router.post('/', protect, admin, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Cloudinary Upload Error:', err);
            return res.status(500).json({ message: err.message || 'Upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    });
});

// @route POST /api/upload/video
router.post('/video', protect, admin, (req, res) => {
    uploadVideo.single('video')(req, res, (err) => {
        if (err) {
            console.error('Cloudinary Video Upload Error:', err);
            return res.status(500).json({ message: err.message || 'Video upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }
        res.json({ url: req.file.path });
    });
});


module.exports = router;
