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
                                 let make = product.Make || '';
                                 let model = product.Model || '';
                                 let key = `${make}|${model}`;

                                 if (!lightspeedMap.has(key)) {
                                     lightspeedMap.set(key, []);
                                 }

                                 lightspeedMap.get(key).push({
                                     vin: product.VIN || null,
                                     stockNumber: product.StockNumber || null
                                 });

                                 let productData = await transformProductData(product, dealer._id);
                                 await productLightspeedService.createProduct(productData);
                             }

                             let platformProducts = await productService.getProducts({ user_id: dealer._id });

                             for (let platformProduct of platformProducts) {
                                 let make = platformProduct.make;
                                 let model = platformProduct.model;
                                 let key = `${make}|${model}`;
                                 let matchedProducts = lightspeedMap.get(key);
                                 let matchedProduct = matchedProducts ? matchedProducts[0] : null;

                                 if (matchedProduct) {
                                     await platformProduct.set({
                                         is_math: true,
                                         stock_number: matchedProduct.stockNumber,
                                         vin: matchedProduct.vin,
                                         status: config.PRODUCT_STATUSES.ACTIVE,
                                         lightspeed_status: "in stock"
                                     });
                                 } else {
                                     await platformProduct.set({
                                         is_math: false,
                                         vin: null,
                                         stock_number: null,
                                         status: config.PRODUCT_STATUSES.DRAFT,
                                         lightspeed_status: "out of stock"
                                     });
                                 }
                                 await platformProduct.save();
                             }
                         }
                         let matchProducts = await productService.getProducts({ user_id: dealer._id ,is_math:true});
                         if(matchProducts && matchProducts.length){
                             for(let product of matchProducts) {
                                 await productLightspeedService.updateProduct({is_math:true},{make:product.make,model:product.model,vin:product.vin,stock_number:product.stock_number})
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
        user_id: userId,
        callouts : data.Comments ? data.Comments : (data.WebTitle ? data.WebTitle : (data.Condition ? data.Condition :null)),
        banner_content : data.CodeName ? data.CodeName : null,
        feature : data.HullConstruction ? data.HullConstruction : null,
        tech_specs : `${data.Length} ${data.FuelType} ${data.HP} ${data.Engine1displacement} ${data.Cylinders}`,
        warranty_content : data.servicecontractterm,
        warranty_link : null
    };
};