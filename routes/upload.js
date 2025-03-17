const express = require('express');
const router = express.Router();
const uploadFile = require('../middlewares/upload-file');

const uploadController = require('../controllers/uploadFile');

const validateTokenMiddleware = require('../middlewares/valid-token');


router

    .post('/uploadFile',
        validateTokenMiddleware,
        uploadFile,
        uploadController.userUploadFile
    )
    .post('/deleteUploadFile',
        validateTokenMiddleware,
        uploadController.deleteUploadFile
    )

module.exports = router;