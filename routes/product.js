const express = require('express');
const router = express.Router();


const productController = require('../controllers/product');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/createProduct',
        validateTokenMiddleware,
        productController.createProduct
    )
    .post('/updateProduct',
        validateTokenMiddleware,
        productController.updateProduct
    )
    .get('/getProduct/:_id',
        validateTokenMiddleware,
        productController.getProduct
    )
    .get('/getAllProducts',
        validateTokenMiddleware,
        productController.getAllProducts
    )
    .post('/deleteProduct',
        validateTokenMiddleware,
        productController.deleteProduct
    )
    .post('/importProducts',
        validateTokenMiddleware,
        productController.importProducts
    )


module.exports = router;