const log = require("../utils/logger");
const errors = require("../configs/errors");
const productService = require('../services/product')
const categoryService = require('../services/category')
const collectionService = require('../services/collection')
const config = require('../configs/config')

module.exports = {
    createProduct: async (req, res) => {
        try {
            log.info(`Start createProduct. Data: ${JSON.stringify(req.body)}`);

            const {
                title,
                description,
                media,
                pricing,
                include_feels,
                doc,
                freight,
                setup,
                cost_per_item,
                profit,
                margin,
                attributes,
                status,
                published,
                product_organization,
            } = req.body;
            const {user_id} = req.user


            if (!title  || !user_id ||!product_organization ||!product_organization.category || !product_organization.collection) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            let categoryId = product_organization.category._id ? product_organization.category._id :
                (await categoryService.createCategory({ title: product_organization.category.title, user_id: user_id }))?._id;
            let collectionId = product_organization.collection._id ? product_organization.collection._id :
                (await collectionService.createCollection({ title: product_organization.collection.title, user_id: user_id }))?._id;

            let data = {
                title,
                description,
                media,
                pricing,
                include_feels,
                doc,
                freight,
                setup,
                cost_per_item,
                profit,
                margin,
                attributes,
                status: status? status:config.PRODUCT_STATUSES.DRAFT,
                published,
                product_organization: {
                    category: categoryId,
                    collection: collectionId
                },
                user_id
            };

            if (product_organization.search) data.product_organization.search = product_organization.search;
            if (product_organization.vendor) data.product_organization.vendor = product_organization.vendor;

            let product = await productService.createProduct(data);

            let result = await productService.getProduct({_id:product._id})

            log.info(`End createProduct. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async updateProduct (req,res){
        try {
            log.info(`Start updateProduct. Data: ${JSON.stringify(req.body)}`);

            const {
                _id,
                title,
                description,
                media,
                pricing,
                include_feels,
                doc,
                freight,
                setup,
                cost_per_item,
                profit,
                margin,
                attributes,
                status,
                published,
                product_organization,
            } = req.body;
            const {user_id} = req.user


            if (!_id ||!title  || !user_id ||!product_organization ||!product_organization.category || !product_organization.collection) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            let categoryId = product_organization.category._id ? product_organization.category._id :
                (await categoryService.createCategory({ title: product_organization.category.title, user_id: user_id }))?._id;
            let collectionId = product_organization.collection._id ? product_organization.collection._id :
                (await collectionService.createCollection({ title: product_organization.collection.title, user_id: user_id }))?._id;

            let data = {
                title,
                description,
                media,
                pricing,
                include_feels,
                doc,
                freight,
                setup,
                cost_per_item,
                profit,
                margin,
                attributes,
                status: status? status:config.PRODUCT_STATUSES.DRAFT,
                published,
                product_organization: {
                    category: categoryId,
                    collection: collectionId
                },
                user_id
            };

            if (product_organization.search) data.product_organization.search = product_organization.search;
            if (product_organization.vendor) data.product_organization.vendor = product_organization.vendor;

            await productService.updateProduct(data,{_id:_id});

            let result = await productService.getProduct({_id:_id})

            log.info(`End updateProduct. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getProduct (req,res) {
        try {
            log.info(`Start getProduct. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.params
            if (!_id) {
                log.error(`${JSON.stringify(errors.NO_FIND_DATA)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_DATA.message,
                    errCode: errors.NO_FIND_DATA.code,
                });
            }

            let result = await productService.getProduct({_id: _id});
            log.info(`End getProduct. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getAllProducts (req,res){
        try {
            log.info(`Start getAllProducts. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            let result = await productService.getProducts({user_id:user_id});

            log.info(`End getAllProducts. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async deleteProduct(req,res) {
        try {
            log.info(`Start deleteProduct. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.body

            await productService.deleteProduct({_id:_id});

            log.info(`End deleteProduct`);

            return res.status(201).json({delete:_id});
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async importProducts(req,res){
        try {
            log.info(`Start importProducts. Data: ${JSON.stringify(req.body)}`);
            const {data} = req.body
            const {user_id} =req.user

            if(!data || data && !data.length){
                for(let item of data){
                    if(!item.title || !item.vendor || !item.category || !item.price || !item.media || item.media && !item.media.length){
                        log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                        return res.status(400).json({
                            message: errors.NOT_ALL_DATA.message,
                            errCode: errors.NOT_ALL_DATA.code,
                        });
                    }
                }
            }
            let allCategory = []
            for (let item of data){
                let category = await categoryService.findCategoryOrCreate({ title: item.category, user_id: user_id });
                let categoryId = category?._id;
                let data = {
                    title:item.title,
                    product_organization:{
                        vendor:item.vendor,
                        category: categoryId
                    },
                    pricing:{
                        price:item.price
                    },
                    media:item.media,
                    user_id:user_id
                }

                let product = await productService.createProduct(data)
                allCategory.push(await productService.getProduct({_id:product._id}))
            }


            log.info(`End importProducts, Data:${JSON.stringify(allCategory)}`);

            return res.status(201).json(allCategory);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }

};
