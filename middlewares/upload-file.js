const multer = require('multer');
const path = require('path');
const { Blob } = require('@vercel/blob');

const blob = new Blob();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadFile = async (req, res, next) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'File upload error', error: err.message });
        }
        try {
            const ext = path.extname(req.file.originalname);
            const filename = Date.now() + ext;

            const blobData = await blob.upload({
                data: req.file.buffer,
                contentType: req.file.mimetype,
                name: filename,
            });

            req.file_size = req.file.size;
            req.file_name = filename;
            req.file_path = blobData.url;

            next();
        } catch (uploadError) {
            console.error(uploadError);
            return res.status(500).json({ message: 'Error uploading file to Vercel Blob', error: uploadError.message });
        }
    });
};

module.exports = uploadFile;