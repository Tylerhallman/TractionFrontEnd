const log = require("../utils/logger");
const errors = require("../configs/errors");
const customerService = require('../services/customer')

module.exports = {
    createCustomer: async (req, res) => {
        try {
            log.info(`Start createCustomer. Data: ${JSON.stringify(req.body)}`);

            const {
                first_name,
                last_name,
                language,
                phone,
                email,
                address,
            } = req.body;
            const {user_id} = req.user


            if (!first_name  || !last_name ||!language ||!phone || !email) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            let data = {
                first_name,
                last_name,
                language,
                phone,
                email,
                address,
                user_id
            };
            let customerPhone = await customerService.getCustomer({phone:phone,user_id:user_id})
            if(customerPhone){
                log.error(`${JSON.stringify(errors.EXIST_CUSTOMER_WITH_PHONE)}`);
                return res.status(400).json({
                    message: errors.EXIST_CUSTOMER_WITH_PHONE.message,
                    errCode: errors.EXIST_CUSTOMER_WITH_PHONE.code,
                });
            }
            let customerEmail = await customerService.getCustomer({email:email,user_id:user_id})
            if(customerEmail){
                log.error(`${JSON.stringify(errors.EXIST_CUSTOMER_WITH_EMAIL)}`);
                return res.status(400).json({
                    message: errors.EXIST_CUSTOMER_WITH_EMAIL.message,
                    errCode: errors.EXIST_CUSTOMER_WITH_EMAIL.code,
                });
            }

            let result = await customerService.createCustomer(data);


            log.info(`End createCustomer. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async updateCustomer (req,res){
        try {
            log.info(`Start updateCustomer. Data: ${JSON.stringify(req.body)}`);

            const {_id,...data} = req.body;


            if (!_id) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            await customerService.updateCustomer(data,{_id:_id});

            let result = await customerService.getCustomer({_id:_id})

            log.info(`End updateCustomer. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getCustomer (req,res) {
        try {
            log.info(`Start getCustomer. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.params
            if (!_id) {
                log.error(`${JSON.stringify(errors.NO_FIND_DATA)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_DATA.message,
                    errCode: errors.NO_FIND_DATA.code,
                });
            }

            let result = await customerService.getCustomer({_id: _id});
            log.info(`End getCustomer. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getAllCustomers (req,res){
        try {
            log.info(`Start getAllCustomers. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            let result = await customerService.getCustomers({user_id:user_id});

            log.info(`End getAllCustomers. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async deleteCustomer(req,res) {
        try {
            log.info(`Start deleteProduct. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.body

            await customerService.deleteCustomer({_id:_id});

            log.info(`End deleteCustomer`);

            return res.status(201).json({delete:_id});
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }
};
