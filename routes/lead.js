const express = require('express');
const router = express.Router();

const leadController = require('../controllers/lead');
const validateTokenMiddleware = require('../middlewares/valid-token');

router
    .get('/getAllLeads',
        validateTokenMiddleware,
        leadController.getAllLeads
    )
    .get('/getLead/:_id',
        validateTokenMiddleware,
        leadController.getLead
    )

module.exports = router;