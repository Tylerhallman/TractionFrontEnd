const log = require("../utils/logger");
const config = require('../configs/config')
const cron = require("node-cron");
const axios = require("axios");
const userService = require('../services/user')
const productService = require('../services/product')
const productLightspeedService = require('../services/lightspeedProduct')
const categoryService = require('../services/category')


module.exports = {
     synchronizeProducts :async ()=>  {
         log.info("Start synchronizeProducts");

         cron.schedule("0 3 * * *", async () => {
             log.info("🔄 Start synchronizing products...");

             try {
                 let dealers = await userService.getUsers({ role: config.ROLES.STORE });
                 if (dealers && dealers.length) {
                     for (let dealer of dealers) {
                         if (dealer.cmf_id) {
                             const response = await axios.get(
                                 `${config.LIGHTSPEED_BASE_URL}Unit/${dealer.cmf_id}`,
                                 {
                                     auth: {
                                         username: config.LIGHTSPEED_API_KEY,
                                         password: config.LIGHTSPEED_API_SECRET
                                     },
                                     headers: { "Content-Type": "application/json" }
                                 }
                             );

                             const lightspeedProducts = response.data;

                             await productLightspeedService.deleteProducts({ user_id: dealer._id });

                             let lightspeedMap = new Map();

                             for (let product of lightspeedProducts) {
                                 let model = product.Model.trim();

                                 if (!lightspeedMap.has(model)) {
                                     lightspeedMap.set(model, []);
                                 }
                                 lightspeedMap.get(model).push({
                                     vin: product.VIN || null,
                                     stockNumber: product.StockNumber || null
                                 });

                                 let productData = await transformProductData(product, dealer._id);
                                 await productLightspeedService.createProduct(productData);
                             }

                             let platformProducts = await productService.getProducts({ user_id: dealer._id });

                             for (let platformProduct of platformProducts) {
                                 let make = platformProduct.make.trim().toLowerCase();
                                 let model = platformProduct.model.trim().toLowerCase();
                                 let key = `${make}|${model}`;
                                 let matchedProducts = lightspeedMap.get(key);
                                 let matchedProduct = matchedProducts ? matchedProducts[0] : null;

                                 if (matchedProduct) {
                                     await platformProduct.set({
                                         is_math: true,
                                         stock_number: matchedProduct.stockNumber,
                                         vin: matchedProduct.vin,
                                         lightspeed_status: "in stock"
                                     });
                                 } else {
                                     await platformProduct.set({
                                         is_math: false,
                                         vin: null,
                                         stock_number: null,
                                         lightspeed_status: "out of stock"
                                     });
                                 }
                                 await platformProduct.save();
                             }
                         }
                     }
                 }

                 log.info("Cron synchronizeProducts end.");
             } catch (error) {
                 log.error(`Error processing products: ${error.message}`);
             }
         });
    },

    mathLightspeedProduct:async (user_id,make,model) => {
        log.info("Start mathLightspeedProduct");
        try {
            const dealer = await userService.getUserDetail({_id:user_id});
            const result = {
                is_math:false,
                vin:null,
                stock_number:null,
            }
            if(dealer && dealer.cmf_id){
                const url = `${config.LIGHTSPEED_BASE_URL}Unit/${dealer.cmf_id}?$filter=Model eq '${model}&filter=Make eq '${make}'`
                const response = await axios.get(
                    url,
                    {
                        auth: {
                            username: config.LIGHTSPEED_API_KEY,
                            password: config.LIGHTSPEED_API_SECRET
                        },
                        headers: { "Content-Type": "application/json" }
                    }
                );
                if(response && response.data && response.data.length) {
                    result.is_math = true
                    result.vin = response.data[0].VIN
                    result.stock_number = response.data[0].StockNumber
                }
            }
            log.info("End mathLightspeedProduct");
            return result

        }catch (error) {
            console.log(error.message);

        }
    }
};

const transformProductData = async (data, userId) => {
    const profit = data.WebPrice - data.totalCost;
    const margin = data.WebPrice ? (profit / data.WebPrice) * 100 : 0;
    let category = await categoryService.getCategories({ title: data.MajorUnitSalesCategory });

    return {
        title:`${data.Make} ${data.Model}`,
        description: data.WebDescription,
        media: data.Images && data.Images.length ? data.Images.map(item=>({path:item.ImageUrl})) : [],
        pricing: {
            price: data.WebPrice,
            sale_price: data.DSRP
        },
        include_feels: false,
        doc: 0,
        freight: data.FreightCost,
        setup: 0,
        cost_per_item: data.totalCost,
        profit: profit,
        margin: margin,
        year:data.ModelYear,
        make:data.Make,
        model:data.Model,
        vin:data.VIN,
        published: {
            online_store: false,
            facebook_page: false,
            facebook_marketplace: false
        },
        product_organization: {
            search: data.Model,
            category: category ? category._id : null,
            vendor: data.Manufacturer,
            collection: null
        },
        stock_number: data.StockNumber,
        user_id: userId
    };
};