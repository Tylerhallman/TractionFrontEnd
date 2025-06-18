const log = require("../utils/logger");
const userService = require('../services/user')
const productService = require('../services/product')
const errors = require("../configs/errors");
const config = require("../configs/config");
const typeService = require("../services/type");
const categoryService = require("../services/category");
const leadService = require("../services/lead");
const contentService = require("../services/content");
const customerService = require("../services/customer");

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

    async createLead(req, res) {
        try {
            log.info(`Start createLead. Data: ${JSON.stringify(req.body)}`);

            const { product_id, store, type,email,phone,first_name,last_name,firstName,lastName,full_name, ...rest } = req.body;

            if (!store) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            let data = {
                ...rest,
                user_id: store,
                first_name:first_name ? first_name :null,
                last_name:last_name ? last_name : null,
                firstName:firstName ? firstName :null,
                lastName:lastName ? lastName : null,
                full_name:full_name ? full_name :null,
                type,
                email,
                phone,
                created_at: new Date()
            };

            if (product_id) {
                let product = await productService.getProduct({ _id: product_id });
                if (product) {
                    data.product = product;
                }
            }

            const result = await leadService.createLead(data);

            let customerExist = await customerService.getCustomer({email:email})
            if(!customerExist){
                let splitName = full_name.split(' ');
                let data_first_name = first_name ? first_name : (firstName ? firstName : (splitName && splitName.length ? splitName[0] : null));
                let data_last_name = last_name ? last_name : (lastName ? lastName : (splitName && splitName.length ? splitName[1] : null));

                await customerService.createCustomer(
                    {
                        first_name:data_first_name ? data_first_name : null,
                        last_name: data_last_name ? data_last_name : null,
                        email:email,
                        phone:phone,
                        user_id:store,
                    }
                )
            }
            log.info(`End createLead. Data: ${JSON.stringify(result)}`);
            return res.status(201).json(result);

        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    getContent:async(req,res)=>{
        try {
            const {_id} = req.params
            const content = await contentService.getContent({ user_id: _id });

            if (!content) {
                return res.status(404).json({ message: "No content found for user" });
            }

            return res.status(200).json({
                homepageEntryId: content.homepageEntryId,
                typesEntryId: content.typesEntryId,
                newsEntryId: content.newsEntryId,
            });
        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400,
            });
        }
    },
    getStoreVendors: async (req, res) => {
        try {
            log.info(`Start getStoreVendors. Data: ${JSON.stringify(req.query)}`);

            const { store } = req.query;
            if (!store) {
                return res.status(404).json({ message: "No selected store" });
            }

            const products = await productService.getProducts({
                user_id: store,
                status: config.PRODUCT_STATUSES.ACTIVE
            });

            const vendors = products
                .map(p => p.product_organization.vendor)
                .filter(v => !!v);

            const uniqueVendors = [...new Set(vendors)];

            log.info(`End getStoreVendors. Vendors: ${JSON.stringify(uniqueVendors)}`);

            return res.status(200).json(uniqueVendors);
        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400,
            });
        }
    }

};
