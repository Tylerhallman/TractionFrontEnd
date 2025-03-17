const log = require("../utils/logger");
const collectionService = require('../services/collection')

module.exports = {
    async getAllCollection (req,res){
        try {
            log.info(`Start getAllCollection. Data: ${JSON.stringify(req.body)}`);
            const search = req.body.search || req.query.search

            let result = await collectionService.getCollections({},search);

            log.info(`End getAllCollection. Data: ${JSON.stringify(result)}`);

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
