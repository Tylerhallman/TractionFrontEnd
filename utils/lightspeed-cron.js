const log = require("../utils/logger");
const config = require('../configs/config')
const cron = require("node-cron");
const axios = require("axios");
const userService = require('../services/user')
const productService = require('../services/product')
const categoryService = require('../services/category')


module.exports = {
    synchronizeProducts: async () => {
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

                            const products = response.data;

                            let productMap = {};

                            for (let product of products) {
                                let identifier = `${product.Make}-${product.Model}-${product.ModelYear}`;

                                if (!productMap[identifier]) {
                                    productMap[identifier] = {
                                        data: product,
                                        quantity: 0
                                    };
                                }

                                productMap[identifier].quantity += 1;
                            }
                            await productService.updateMany(
                                {
                                    user_id: dealer._id,
                                    identifier: { $exists: true }
                                },
                                {
                                    $set: { quantity: 0 }
                                }
                            )

                            for (let identifier in productMap) {
                                let productData = productMap[identifier].data;
                                let quantity = productMap[identifier].quantity;

                                let existingProduct = await productService.getProduct({
                                    identifier: identifier,
                                    user_id: dealer._id
                                });

                                if (existingProduct) {
                                    existingProduct.set({ quantity });
                                    await existingProduct.save();
                                } else {
                                    let data = await transformProductData(productData, dealer._id, quantity,identifier);
                                    await productService.createProduct(data);
                                }
                            }
                        }
                    }
                }

                log.info(`Cron synchronizeProducts end.`);
            } catch (error) {
                log.error(`Error processing products: ${error.message}`);
            }
        });
    }
};

const transformProductData = async (data, userId, quantity,identifier) => {
    const profit = data.WebPrice - data.totalCost;
    const margin = data.WebPrice ? (profit / data.WebPrice) * 100 : 0;
    let category = await categoryService.getCategories({ title: data.MajorUnitSalesCategory });

    return {
        title: `${data.Make} ${data.Model}`,
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
        quantity: quantity,
        published: {
            online_store: false,
            facebook_page: false,
            facebook_marketplace: false
        },
        product_organization: {
            search: `${data.Make} ${data.Model}`,
            category: category ? category._id : null,
            vendor: data.Manufacturer,
            collection: null
        },
        identifier:identifier,
        stock_number: data.StockNumber,
        user_id: userId
    };
};