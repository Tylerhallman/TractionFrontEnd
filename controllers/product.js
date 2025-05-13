const log = require("../utils/logger");
const errors = require("../configs/errors");
const productService = require('../services/product')
const productLightspeedService = require('../services/lightspeedProduct')
const categoryService = require('../services/category')
const typeService = require('../services/type')
const config = require('../configs/config')
const lightSpeed = require('../utils/lightspeed-cron')

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
                status,
                published,
                product_organization,
                make,
                model,
                year,
                vin,
                callouts,
                banner_content,
                feature,
                tech_specs,
                warranty_content,
                warranty_link,
                gallery_1,
                gallery_2,
                gallery_3
            } = req.body;
            const {user_id} = req.user


            if (!title  || !user_id ||!product_organization ||!product_organization.category || !product_organization.type) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            let categoryId = product_organization.category._id ? product_organization.category._id : null
            let typeId = product_organization.type._id ? product_organization.type._id : null

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
                make,
                model,
                year,
                vin,
                callouts,
                banner_content,
                feature,
                tech_specs,
                warranty_content,
                warranty_link,
                gallery_1,
                gallery_2,
                gallery_3,
                status: status? status:config.PRODUCT_STATUSES.DRAFT,
                published,
                product_organization: {
                    category: categoryId,
                    type: typeId
                },
                user_id
            };

            if (product_organization.search) data.product_organization.search = product_organization.search;
            if (product_organization.vendor) data.product_organization.vendor = product_organization.vendor;


            let match = await lightSpeed.mathLightspeedProduct(user_id,make,model)
            console.log(match,'2623626262623')
            if(match){
                data.is_math = match.is_math;
                data.stock_number = match.stock_number;
                data.vin = match.vin;
            }

            let product = await productService.createProduct(data);

            let result = await productService.getProduct({_id:product._id})

            log.info(`End createProduct. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(true);
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
                status,
                published,
                product_organization,
                make,
                model,
                is_math,
                year,
                vin,
                stock_number,
                callouts,
                banner_content,
                feature,
                tech_specs,
                warranty_content,
                warranty_link,
                gallery_1,
                gallery_2,
                gallery_3,
            } = req.body;
            const {user_id} = req.user


            if (!_id ||!title  || !user_id ||!product_organization ||!product_organization.category || !product_organization.type) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            let categoryId = product_organization.category._id ? product_organization.category._id : null
            let typeId = product_organization.type._id ? product_organization.type._id : null

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
                make,
                model,
                year,
                stock_number,
                vin,
                is_math,
                callouts,
                banner_content,
                feature,
                tech_specs,
                warranty_content,
                warranty_link,
                gallery_1,
                gallery_2,
                gallery_3,
                status: status? status:config.PRODUCT_STATUSES.DRAFT,
                published,
                product_organization: {
                    category: categoryId,
                    type: typeId
                },
                user_id
            };

            if (product_organization.search) data.product_organization.search = product_organization.search;
            if (product_organization.vendor) data.product_organization.vendor = product_organization.vendor;

            await productService.updateProduct(data,{_id:_id});
            await productLightspeedService.updateProduct({is_math:true},{make:make,model:model,vin:vin,stock_number:stock_number})

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
    async getLightspeedProduct (req,res) {
        try {
            log.info(`Start getLightspeedProduct. Data: ${JSON.stringify(req.body)}`);
            const {_id} = req.params
            if (!_id) {
                log.error(`${JSON.stringify(errors.NO_FIND_DATA)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_DATA.message,
                    errCode: errors.NO_FIND_DATA.code,
                });
            }

            let result = await productLightspeedService.getProduct({_id: _id});
            log.info(`End getLightspeedProduct. Data: ${JSON.stringify(result)}`);

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
    findProductName:async(req,res)=>{
        try {
            log.info(`Start findProductName. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {search} = req.body;
            let query = { user_id:user_id };
            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }
            let result = await productLightspeedService.getProducts(query);

            log.info(`End findProductName. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    findProduct:async(req,res)=>{
        try {
            log.info(`Start findProduct. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {search} = req.body;
            let query = { user_id:user_id };
            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }
            let result = await productService.getProducts(query);

            log.info(`End findProduct. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getAllLightspeedProducts (req,res){
        try {
            log.info(`Start getAllLightspeedProducts. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            let result = await productLightspeedService.getProducts({user_id:user_id});

            log.info(`End getAllLightspeedProducts. Data: ${JSON.stringify(result)}`);

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
            let product = await productService.getProduct({_id:_id});
            if(product && product.status === config.PRODUCT_STATUSES.ACTIVE || product && product.status === config.PRODUCT_STATUSES.DRAFT){
                await  productService.updateProduct({status:config.PRODUCT_STATUSES.ARCHIVED}, {_id:_id});
            }else{
                await productService.deleteProduct({_id:_id});
            }
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
