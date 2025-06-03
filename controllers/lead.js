const log = require("../utils/logger");
const errors = require("../configs/errors");
const leadService = require('../services/lead')

module.exports = {
    async getLead (req,res) {
        try {
            log.info(`Start getLead. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.params
            if (!_id) {
                log.error(`${JSON.stringify(errors.NO_FIND_DATA)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_DATA.message,
                    errCode: errors.NO_FIND_DATA.code,
                });
            }

            let result = await leadService.getLead({_id: _id});
            log.info(`End getLead. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getAllLeads (req,res){
        try {
            log.info(`Start getAllLeads. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            let result = await leadService.getAllLeads({user_id:user_id});

            log.info(`End getAllLeads. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }
};
