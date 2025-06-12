const express = require('express');
const router = express.Router();


const contentController = require('../controllers/content');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/update',
        validateTokenMiddleware,
        contentController.updateContent
    )
    .post('/getAsset',
        validateTokenMiddleware,
        contentController.getAsset
    )
    .get('/',
        validateTokenMiddleware,
        contentController.getContent
    )

module.exports = router;