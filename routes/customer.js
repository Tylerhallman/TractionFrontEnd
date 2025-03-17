const express = require('express');
const router = express.Router();


const customerController = require('../controllers/customer');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/createCustomer',
        validateTokenMiddleware,
        customerController.createCustomer
    )
    .post('/updateCustomer',
        validateTokenMiddleware,
        customerController.updateCustomer
    )
    .get('/getCustomer/:_id',
        validateTokenMiddleware,
        customerController.getCustomer
    )
    .get('/getAllCustomers',
        validateTokenMiddleware,
        customerController.getAllCustomers
    )
    .post('/deleteCustomer',
        validateTokenMiddleware,
        customerController.deleteCustomer
    )
    // .post('/importProducts',
    //     validateTokenMiddleware,
    //     productController.importProducts
    // )


module.exports = router;