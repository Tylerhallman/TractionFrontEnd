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
                                 let title = platformProduct.title.trim();
                                 let matchedProducts = lightspeedMap.get(title);

                                 if (matchedProducts && matchedProducts.length) {
                                     let matchedProduct = matchedProducts.shift();
                                     let vin = matchedProduct.vin || null;

                                     const updateAttribute = (key, value) => {
                                         let updatedAttributes = platformProduct.attributes.map(attr =>
                                             attr.key === key ? { ...attr, value } : attr
                                         );
                                         if (!updatedAttributes.find(attr => attr.key === key)) {
                                             updatedAttributes.push({ key, value });
                                         }
                                         platformProduct.attributes = updatedAttributes;
                                     };

                                     await updateAttribute("VIN", vin);
                                     await platformProduct.set({
                                         is_math:true,
                                         stock_number: matchedProduct.stockNumber,
                                         lightspeed_status: "in stock"
                                     });
                                 } else {
                                     const updateAttribute = (key, value) => {
                                         let attr = platformProduct.attributes.find(attr => attr.key === key);
                                         if (attr) {
                                             attr.value = value;
                                         } else {
                                             platformProduct.attributes.push({ key, value });
                                         }
                                     };

                                    await updateAttribute("VIN", null);
                                     await platformProduct.set({
                                         is_math:false,
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

    mathLightspeedProduct:async (user_id,title) => {
        log.info("Start mathLightspeedProduct");
        try {
            const dealer = await userService.getUserDetail({_id:user_id});
            const result = {
                is_math:false,
                vin:null,
                stock_number:null,
            }

            if(dealer && dealer.cmf_id){
                const response = await axios.get(
                    `${config.LIGHTSPEED_BASE_URL}Unit/${dealer.cmf_id}?filter=Model eq ${title}`,
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
                    result.vin = response.data.VIN
                    result.stock_number = response.data.StockNumber
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
        title: data.Model,
        make: data.Make,
        description: data.WebDescription,
        media: [],
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
        attributes: [
            { key: "Condition", value: data.Condition },
            { key: "Year", value: data.ModelYear },
            { key: "VIN", value: data.VIN },
            { key: "Type", value: data.UnitType },
            { key: "Title Status", value: data.titlestatus },
            { key: "Unit Condition", value: data.unitcondition }
        ],
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