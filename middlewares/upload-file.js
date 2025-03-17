const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname,'../public','uploads');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

const uploadFile = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'File upload error', error: err.message });
        }
        req.file_size = req.file.size;
        req.file_name = req.file.filename
        req.file_path = path.join('public', 'uploads', req.file.filename);
        next();
    });
};

module.exports = uploadFile;