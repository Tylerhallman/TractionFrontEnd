const express = require('express');
const router = express.Router();


const settingController = require('../controllers/setting');
const validateTokenMiddleware = require('../middlewares/valid-token');

router

    .get('/getProfile',
        validateTokenMiddleware,
        settingController.getProfile
    )
    .post('/updateProfile',
        validateTokenMiddleware,
        settingController.updateProfile
    )
    .post('/deactivateProfile',
        validateTokenMiddleware,
        settingController.deactivateProfile
    )
    .post('/changePassword',
        validateTokenMiddleware,
        settingController.changePassword
    )
    .post('/sendMailToChangePassword',
        validateTokenMiddleware,
        settingController.sendMailToChangePassword
    )



module.exports = router;