const express = require('express');
const router = express.Router();


const storeController = require('../controllers/store');

router

    .get('/getStore',
        storeController.getStore
    )
    .get('/getStoreProducts',
        storeController.getStoreProducts
    )
    .get('/getProduct/:_id',
        storeController.getProduct
    )
    .get('/getType',
        storeController.getType
    )
    .get('/getCategories',
        storeController.getCategories
    )



module.exports = router;