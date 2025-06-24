const log = require("../utils/logger");
const errors = require("../configs/errors");
const leadService = require('../services/lead')
const productService = require("../services/product");
const { decrypt,encrypt } = require("../utils/crypto");

module.exports = {
    async getLead(req, res) {
        try {
            log.info(`Start getLead. Data: ${JSON.stringify(req.body)}`);
            const { _id } = req.params;

            if (!_id) {
                log.error(`${JSON.stringify(errors.NO_FIND_DATA)}`);
                return res.status(400).json({
                    message: errors.NO_FIND_DATA.message,
                    errCode: errors.NO_FIND_DATA.code,
                });
            }

            await leadService.updateLead({ viewed: true }, { _id });

            let result = await leadService.getLead({ _id });

            if (result?.type === 'finance app') {
                const decryptedLead = { ...result._doc }; //

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

                result = decryptedLead;
            }

            log.info(`End getLead. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getAllLeads (req,res){
        try {
            log.info(`Start getAllLeads. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {type,email} = req.query;

            let find = {
                user_id:user_id,
            }
            if(type){
                find.type = type;
            }
            if(email){
                find.email = email;
            }
            let result = await leadService.getAllLeads(find);

            result = result.map((lead) => {
                if (lead.type === 'finance app') {
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

                    return decryptedLead;
                }
                return lead;
            });

            log.info(`End getAllLeads. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async deleteLead (req,res){
        try {
            log.info(`Start deleteLead. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {_id} = req.body;

            let result = await leadService.deleteLead({_id: _id,user_id:user_id});

            log.info(`End deleteLead. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async updateLead(req, res) {
        try {
            log.info(`Start updateLead. Data: ${JSON.stringify(req.body)}`);

            const { _id, product_id, type, ...rest } = req.body;
            const { user_id } = req.user;

            if (!_id) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            let encryptedRest = {};

            if (type === 'finance app') {
                for (const [key, value] of Object.entries(rest)) {
                    if (
                        ['_id', 'user_id', 'type', 'email', 'phone', 'first_name', 'last_name', 'firstName', 'lastName', 'full_name', 'created_at', 'updated_at', '__v', 'viewed'].includes(key)
                    ) {
                        encryptedRest[key] = value;
                    } else {
                        if (typeof value === 'string' || typeof value === 'number') {
                            const enc = encrypt(String(value));
                            encryptedRest[key] = JSON.stringify(enc);
                        } else {
                            encryptedRest[key] = value;
                        }
                    }
                }
            } else {
                encryptedRest = rest;
            }

            let data = {
                ...encryptedRest,
                user_id: user_id,
                type,
                created_at: new Date()
            };

            if (product_id) {
                let product = await productService.getProduct({ _id: product_id });
                if (product) {
                    data.product = product;
                }
            }

            const result = await leadService.updateLead(data, { _id });
            log.info(`End updateLead. Data: ${JSON.stringify(result)}`);
            return res.status(201).json(result);

        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    getLeadsCountViewed:async(req,res)=>{
        try {
            log.info(`Start createLead. Data: ${JSON.stringify(req.body)}`);

            const {user_id} = req.user

            const [quotes,finance_app,contacts,careers,trade_in,service,parts] =  [
                await leadService.getCount({user_id:user_id, type:'quotes', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'finance app', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'contacts', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'careers', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'trade-in', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'service', viewed:false}),
                await leadService.getCount({user_id:user_id, type:'parts', viewed:false}),
            ]
            const result = {
                quotes,
                finance_app,
                contacts,
                careers,
                trade_in,
                service,
                parts
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
    }
};
