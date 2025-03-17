const express = require('express');
const router = express.Router();


const collectionRouter = require('../controllers/collection');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .post('/getAllCollection',
        validateTokenMiddleware,
        collectionRouter.getAllCollection
    )
    .get('/getAllCollection',
        validateTokenMiddleware,
        collectionRouter.getAllCollection
    )


module.exports = router;