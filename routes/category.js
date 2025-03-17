const express = require('express');
const router = express.Router();


const categoryController = require('../controllers/category');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/getAllCategory',
        validateTokenMiddleware,
        categoryController.getAllCategory
    )
    .get('/getAllCategory',
        validateTokenMiddleware,
        categoryController.getAllCategory
    )


module.exports = router;