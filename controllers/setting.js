const log = require("../utils/logger");
const errors = require("../configs/errors");
const userService = require('../services/user')
const bcryptUtil = require("../utils/bcrypt-util");
const config = require("../configs/config");

module.exports = {
    async updateProfile (req,res){
        try {
            log.info(`Start updateProfile. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {...data} = req.body;

            if(data['email']){
                let emailExist = await userService.getUserDetail({email:data['email'],_id: {$ne:user_id }})
                if(emailExist){
                    log.error(`${JSON.stringify(errors.EXIST_STORE_WITH_EMAIL)}`);
                    return res.status(400).json({
                        message: errors.EXIST_STORE_WITH_EMAIL.message,
                        errCode: errors.EXIST_STORE_WITH_EMAIL.code,
                    });
                }
            } if(data['phone']){
                let phoneExist = await userService.getUserDetail({phone:data['phone'],_id: {$ne:user_id }})
                if(phoneExist){
                    log.error(`${JSON.stringify(errors.EXIST_STORE_WITH_PHONE)}`);
                    return res.status(400).json({
                        message: errors.EXIST_STORE_WITH_PHONE.message,
                        errCode: errors.EXIST_STORE_WITH_PHONE.code,
                    });
                }
            }

            await userService.updateUser({_id:user_id},data);

            let result = await userService.getUserDetail({_id:user_id},'_id full_name email phone business_address store_currency');

            log.info(`End updateProfile. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getProfile (req,res) {
        try {
            log.info(`Start getProfile. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            let result = await userService.getUserDetail({_id:user_id},'_id full_name email phone business_address store_currency');
            log.info(`End getProfile. Data: ${JSON.stringify(result)}`);

            return res.status(201).json(result);
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async deactivateProfile(req,res){
        try {
            log.info(`Start getProfile. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {password} = req.body

            const user = await userService.getUserDetail({_id:user_id},'_id role password');

            if (!user) {
                log.error(`${JSON.stringify(errors.USER_NOT_FOUND)}`);
                return res.status(400).json({
                    message: errors.USER_NOT_FOUND.message,
                    errCode: errors.USER_NOT_FOUND.code,
                });
            }
            const isPasswordMatch = await bcryptUtil.comparePassword(password, user.password);
            if (!isPasswordMatch) {
                log.error(`${JSON.stringify(errors.USER_PASSWORD_WRONG)}`);
                return res.status(400).json({
                    message: errors.USER_PASSWORD_WRONG.message,
                    errCode: errors.USER_PASSWORD_WRONG.code,
                });
            }
            await userService.updateUser({_id:user_id},{status:config.USER_STATUS.DEACTIVATE})
            log.info(`End getProfile. Data: ${JSON.stringify({deactivate:true})}`);

            return res.status(201).json({deactivate:true});
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }
};
