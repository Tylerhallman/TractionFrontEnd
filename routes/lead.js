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
    .post('/deleteLead',
    validateTokenMiddleware,
        leadController.deleteLead
    )
    .post('/updateLead',
        validateTokenMiddleware,
        leadController.updateLead
    )
    .get('/getLeadsCountViewed',
        validateTokenMiddleware,
        leadController.getLeadsCountViewed
    )

module.exports = router;