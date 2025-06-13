const log = require("../utils/logger");
const errors = require("../configs/errors");
const leadService = require('../services/lead')
const productService = require("../services/product");

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
            const {type} = req.query.type;

            let find = {
                user_id:user_id,
            }
            if(type){
                find.type = type;
            }
            let result = await leadService.getAllLeads(find);

            log.info(`End getAllLeads. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async deleteLead (req,res){
        try {
            log.info(`Start deleteLead. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {_id} = req.body;

            let result = await leadService.deleteLead({_id: _id,user_id:user_id});

            log.info(`End deleteLead. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async updateLead (req,res){
        try {
            log.info(`Start createLead. Data: ${JSON.stringify(req.body)}`);

            const {_id,product_id, store, type, ...rest } = req.body;
            const {user_id} = req.user

            if (!store) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            let data = {
                ...rest,
                user_id: user_id,
                type,
                created_at: new Date()
            };

            if (product_id) {
                let product = await productService.getProduct({ _id: product_id });
                if (product) {
                    data.product = product;
                }
            }

            const result = await leadService.updateLead(data,{_id:_id});
            log.info(`End createLead. Data: ${JSON.stringify(result)}`);
            return res.status(201).json(result);

        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }
};
