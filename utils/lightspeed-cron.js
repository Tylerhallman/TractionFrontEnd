const log = require("../utils/logger");
const config = require('../configs/config')
const cron = require("node-cron");
const axios = require("axios");
const userService = require('../services/user')
const productService = require('../services/product')
const productLightspeedService = require('../services/lightspeedProduct')
const categoryService = require('../services/category')
const { create } = require('xmlbuilder2');
const {decrypt} = require("./crypto");

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
    },
    sendLeadToLightspeed:async(lead,dealershipId) =>{

        try {
            if (lead?.type === 'finance app') {
                const decryptedLead = { ...lead._doc };

                for (const [key, value] of Object.entries(decryptedLead)) {
                    if (
                        ['_id', 'user_id', 'type', 'email', 'phone', 'first_name', 'last_name', 'firstName', 'lastName', 'full_name', 'created_at', 'updated_at', '__v', 'viewed'].includes(key)
                    ) continue;

                    try {
                        const parsed = JSON.parse(value);
                        if (parsed.iv && parsed.content) {
                            decryptedLead[key] = decrypt(parsed);
                        }
                    } catch (e) {
                        decryptedLead[key] = value;
                    }
                }

                lead = decryptedLead;
            }

            const endpoint = config.LIGHTSPEED_CREATE_URL;
            const xml = await mapLeadToLightspeedXML(lead, dealershipId);
            console.log(xml)
            const response = await axios.post(
                `${endpoint}?method=AddProspect&sourceid=${config.LIGHTSPEED_SOURCE_ID}`,
                new URLSearchParams({ ProspectXML: xml }),
                {
                    headers: {
                        'X-PCHAPIKey': config.LIGHTSPEED_CREATE_API_KEY,
                        'SOAPAction':"https://tempuri.org/AddProspect",
                        'Content-Type': 'text/xml',
                    },
                }
            );
            console.log('✅ Lead sent successfully:\n', response.data);
            return true
        } catch (error) {
            console.log(error)
            console.error('❌ Error sending lead:', error.response?.data || error.message);
        }
    }
};

const mapLeadToLightspeedXML = async (lead, dealershipId) => {
    try {
        const sourceProspectId = `${dealershipId}_${lead._id}`;
        const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.full_name || 'Unknown';

        const notesParts = [];

        const noteFields = [
            'maritalStatus', 'housingStatus', 'landlord', 'rentAmount',
            'timeAtResidenceYears', 'bankName1', 'accountType1', 'employerName',
            'salary', 'employmentYears', 'employmentType', 'otherIncome',
            'incomeFrequency', 'comments'
        ];
        noteFields.forEach((field) => {
            if (lead[field]) {
                notesParts.push(`${field}: ${lead[field]}`);
            }
        });

        if (lead.description) {
            notesParts.push(`Description: ${lead.description}`);
        }

        const references = [];
        for (let i = 1; i <= 4; i++) {
            const ref = lead[`reference${i}`];
            if (ref) {
                references.push(`Reference ${i}: ${ref.name || ''}, ${ref.phone || ''}, ${ref.city || ''}, ${ref.state || ''}`);
            }
        }

        if (references.length) {
            notesParts.push(...references);
        }

        const notes = notesParts.join('\n');

        const xmlBuilder = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('ProspectImport')
            .ele('Item');

        xmlBuilder.ele('SourceProspectId').txt(sourceProspectId).up();
        xmlBuilder.ele('DealershipId').txt(dealershipId).up();
        xmlBuilder.ele('Name').txt(name).up();

        const fieldMap = {
            Email: lead.email,
            Phone: lead.residencePhone || lead.phone,
            AltPhone: lead.workPhone,
            Gender: lead.gender,
            Birthdate: lead.dateOfBirth,
            DLNumber: lead.license,
            SSN: lead.ssn,
            Address1: lead.physicalAddress,
            City: lead.city,
            State: lead.state,
            ZipCode: lead.zip,
            Country: lead.country,
            VehicleNewUsed: lead.product?.vehicleCondition || lead?.vehicleCondition,
            VehicleMake: lead.product?.make || lead?.vehicleMake,
            VehicleModel: lead.product?.model || lead?.vehicleModel,
            VehicleYear: lead.product?.year || lead?.vehicleYear,
            VehicleType: lead.product?.vehicleType || lead?.vehicleType,
            VehiclePrice: lead.product?.pricing?.price || lead?.downPayment,
            PurchaseTimeframe: lead.purchaseTimeframe || 'Soon',
        };

        for (const [key, value] of Object.entries(fieldMap)) {
            if (value !== undefined && value !== null && value !== '') {
                xmlBuilder.ele(key).txt(String(value)).up();
            }
        }

        if (notes) {
            xmlBuilder.ele('Notes').dat(notes).up();
        }

        const xml = xmlBuilder.up().up().end({ prettyPrint: true });
        return xml;
    } catch (err) {
        throw err;
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