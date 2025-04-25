const express = require('express');
const router = express.Router();


const typeRouter = require('../controllers/type');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/getAllType',
        validateTokenMiddleware,
        typeRouter.getAllType
    )
    .get('/getAllType',
        validateTokenMiddleware,
        typeRouter.getAllType
    )


module.exports = router;