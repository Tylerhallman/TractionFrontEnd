const log = require("../utils/logger");
const errors = require("../configs/errors");
const userService = require('../services/user')
const bcryptUtil = require("../utils/bcrypt-util");
const config = require("../configs/config");

const {passwordValidation} = require("../helper/validation");
const {hashPassword} = require("../utils/bcrypt-util");

const mailUtil = require('../utils/mail-util')


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
    },
    changePassword:async(req,res)=>{
        try {
            log.info(`Start changePassword. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user
            const {new_password,confirm_password} = req.body
            if(!new_password || !confirm_password){
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }
            const user = await userService.getUserDetail({_id:user_id},'_id role password');

            if (!user) {
                log.error(`${JSON.stringify(errors.USER_NOT_FOUND)}`);
                return res.status(400).json({
                    message: errors.USER_NOT_FOUND.message,
                    errCode: errors.USER_NOT_FOUND.code,
                });
            }
            if (! await passwordValidation(new_password)) {
                log.error(`${JSON.stringify(errors.BAD_REQUEST_NOT_VALID_PASSWORD)}`);
                return res.status(errors.BAD_REQUEST_NOT_VALID_PASSWORD.code).json({
                    message: errors.BAD_REQUEST_NOT_VALID_PASSWORD.message,
                    errCode: errors.BAD_REQUEST_NOT_VALID_PASSWORD.code,
                })
            }
            if(new_password !== confirm_password){
                log.error(`${JSON.stringify(errors.BAD_REQUEST_PASSWORD_NOT_MUCH_CONFIRM_PASSWORD)}`);
                return res.status(400).json({
                    message: errors.BAD_REQUEST_PASSWORD_NOT_MUCH_CONFIRM_PASSWORD.message,
                    errCode: errors.BAD_REQUEST_PASSWORD_NOT_MUCH_CONFIRM_PASSWORD.code,
                });
            }
            await userService.updateUser({_id:user_id},{password: await hashPassword(new_password)})
            log.info(`End changePassword. Data: ${JSON.stringify({deactivate:true})}`);

            return res.status(201).json({deactivate:true});
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    sendMailToChangePassword:async(req,res)=>{
        try {
            log.info(`Start changePassword. Data: ${JSON.stringify(req.body)}`);
            const {user_id} = req.user

            const user = await userService.getUserDetail({_id:user_id},'_id email full_name');

            if (!user) {
                log.error(`${JSON.stringify(errors.USER_NOT_FOUND)}`);
                return res.status(400).json({
                    message: errors.USER_NOT_FOUND.message,
                    errCode: errors.USER_NOT_FOUND.code,
                });
            }
            let mailObj = {
                from:config.MAIL_DEFAULT_REPLY,
                to: user.email,
                subject: "Change password",
                data: {
                    full_name:user.full_name,
                    url:`${config.FRONT_URL}reset-password`
                }
            };
            await mailUtil.sendMail(mailObj,'change_password')
            log.info(`End changePassword. Data: ${JSON.stringify({send:true})}`);

            return res.status(201).json({send:true});
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    }
};
