const log = require("../utils/logger");
const userService = require('../services/user')
const productService = require('../services/product')
const errors = require("../configs/errors");
const config = require("../configs/config");
const typeService = require("../services/type");
const categoryService = require("../services/category");
const leadService = require("../services/lead");

module.exports = {
    async getStore (req,res){
        try {
            log.info(`Start getStore. Data: ${JSON.stringify(req.body)}`);
            const {name} = req.query

            let store = await userService.getUserDetail({full_name:name,status:config.USER_STATUS.ACTIVE});
            if(!store){
                log.error(`${JSON.stringify(errors.NO_FIND_STORE)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_STORE.message,
                    errCode: errors.NO_FIND_STORE.code,
                });
            }

            const {password,role,access_token,expired,refresh_token,...result} = store.toJSON()

            log.info(`End getStore. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },

    async getStoreProducts (req,res){
        try {
            log.info(`Start getStoreProducts. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.query

            let store = await userService.getUserDetail({_id:_id,status:config.USER_STATUS.ACTIVE});
            if(!store){
                log.error(`${JSON.stringify(errors.NO_FIND_STORE)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_STORE.message,
                    errCode: errors.NO_FIND_STORE.code,
                });
            }
            let products = await productService.getProducts({user_id:_id,status:config.PRODUCT_STATUSES.ACTIVE})



            log.info(`End getStoreProducts. Data: ${JSON.stringify(products)}`);

            return res.status(201).json(products);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getProduct (req,res){
        try {
            log.info(`Start getProduct. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.params

            let product = await productService.getProduct({_id:_id,status:config.PRODUCT_STATUSES.ACTIVE})
            if(!product){
                log.error(`${JSON.stringify(errors.NO_FIND_PRODUCT)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_PRODUCT.message,
                    errCode: errors.NO_FIND_PRODUCT.code,
                });
            }
            log.info(`End getProduct. Data: ${JSON.stringify(product)}`);

            return res.status(201).json(product);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getType(req,res){
        try {
            log.info(`Start getType. Data: ${JSON.stringify(req.body)}`);
            const search = req.body.search || req.query.search

            let result = await typeService.getType({},search);
            result = await Promise.all(result.map(async (item) => {
                const obj = item.toObject();
                const category = await categoryService.getCategories(null, null, item._id);
                obj.category = category;
                return obj;
            }));
            log.info(`End getType. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getCategories(req,res){
        try {
            log.info(`Start getCategories. Data: ${JSON.stringify(req.body)}`);
            const search = req.body.search || req.query.search

            let result = await categoryService.getCategories({},search);

            log.info(`End getCategories. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },

    async createLead(req,res){
        try {
            log.info(`Start createLead. Data: ${JSON.stringify(req.body)}`);
            const {product_id,first_name,last_name,email,phone,how_did,description,subscribe,store}=req.body;

            if( !product_id ||!first_name || !last_name || !email || !phone || !phone || !how_did || !store){
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            let product = await  productService.getProduct({_id: product_id});

            let data = {
                first_name,
                last_name,
                email,
                phone,
                how_did,
                description,
                subscribe,
                product,
                user_id:store
            }

            let result = await leadService.createLead(data);

            log.info(`End createLead. Data: ${JSON.stringify(result)}`);

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
