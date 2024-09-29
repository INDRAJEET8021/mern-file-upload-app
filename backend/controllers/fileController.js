const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');
const path = require('path');

// Set up Multer storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp3|mp4|pdf/;
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File type not supported!');
        }
    },
}).single('file');

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private
const uploadFile = (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileType = req.file.mimetype;

        try {
            let fileURL = '';

            if (fileType.startsWith('image')) {
                // Upload image to Cloudinary with manipulation (e.g., resize)
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'uploads',
                        transformation: [{ width: 800, height: 800, crop: 'limit' }],
                    },
                    (error, result) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({ message: 'Cloudinary upload failed' });
                        }
                        fileURL = result.secure_url;
                        res.status(200).json({
                            message: 'Image uploaded and manipulated successfully',
                            url: fileURL,
                            type: fileType,
                        });
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            } else {
                // For audio, video, and pdf, upload to Cloudinary without manipulation
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: fileType.startsWith('audio') ? 'raw' :
                                       fileType.startsWith('video') ? 'video' :
                                       'raw', // PDFs as raw
                        folder: 'uploads',
                    },
                    (error, result) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({ message: 'Cloudinary upload failed' });
                        }
                        fileURL = result.secure_url;
                        res.status(200).json({
                            message: 'File uploaded successfully',
                            url: fileURL,
                            type: fileType,
                        });
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error during file upload' });
        }
    });
};

module.exports = { uploadFile };
