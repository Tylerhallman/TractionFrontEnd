const multer = require('multer');
const path = require('path');
const config = require('../configs/config');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { put } = require('@vercel/blob');

const uploadFile = async (req, res, next) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ message: 'File upload error', error: err.message });
        }

        try {
            const ext = path.extname(req.file.originalname);
            const filename = Date.now() + ext;

            if (!req.file || !req.file.buffer) {
                throw new Error('File buffer not found.');
            }

            console.log('File Buffer:', req.file.buffer);
            console.log('File Type:', req.file.mimetype);
            console.log('File Name:', filename);

            const { url } = await put(filename,req.file.buffer,{
                access:"public",
                token:config.BLOB_READ_WRITE_TOKEN
            });

            req.file_size = req.file.size;
            req.file_name = filename;
            req.file_path = url;

            next();
        } catch (uploadError) {
            console.error('Blob upload error:', uploadError);
            return res.status(500).json({ message: 'Error uploading file to Vercel Blob', error: uploadError.message });
        }
    });
};

module.exports = uploadFile;