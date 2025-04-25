const log = require("../utils/logger");
const categoryService = require('../services/category')

module.exports = {
    async getAllCategory (req,res){
        try {
            log.info(`Start getAllCategory. Data: ${JSON.stringify(req.body)}`);
            const search = req.body.search || req.query.search
            const type = req.body.type || req.query.type;

            let result = await categoryService.getCategories({},search,type);

            log.info(`End getAllCategory. Data: ${JSON.stringify(result)}`);

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
