const log = require("../utils/logger");
const typeService = require('../services/type')

module.exports = {
    async getAllType (req,res){
        try {
            log.info(`Start getAllType. Data: ${JSON.stringify(req.body)}`);
            const search = req.body.search || req.query.search

            let result = await typeService.getType({},search);

            log.info(`End getAllType. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },

};
