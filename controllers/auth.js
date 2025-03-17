const config = require('../configs/config');
const errors = require("../configs/errors");
const userService = require('../services/user');
const bcryptUtil = require('../utils/bcrypt-util')
const tokenUtil = require('../utils/tokenUtil');
const log = require("../utils/logger");

module.exports = {
    login: async (req, res) => {
        try {
            log.info(`Start login. Data: ${JSON.stringify(req.body)}`);
            const {email, password} = req.body;

            if (!email || !password) {
                log.error(`${JSON.stringify(errors.LOGIN_NO_SELECT_DATA)}`);
                return res.status(400).json({
                    message: errors.LOGIN_NO_SELECT_DATA.message,
                    errCode: errors.LOGIN_NO_SELECT_DATA.code,
                });
            }

            const user = await userService.getUserDetail({email: email},'_id role password');

            if (!user) {
                log.error(`${JSON.stringify(errors.USER_NOT_FOUND)}`);
                return res.status(400).json({
                    message: errors.USER_NOT_FOUND.message,
                    errCode: errors.USER_NOT_FOUND.code,
                });
            }
            const isPasswordMatch = await bcryptUtil.comparePassword(password, user.password);
            if (!isPasswordMatch) {
                log.error(`${JSON.stringify(errors.USER_NOT_FOUND)}`);
                return res.status(400).json({
                    message: errors.USER_NOT_FOUND.message,
                    errCode: errors.USER_NOT_FOUND.code,
                });
            }

            const token = tokenUtil({
                user_id: user._id,
                role: user.role,
            });

            await updateUserSession(user, token)

            res.setHeader('Authorization', token.access_token);

            log.info(`End login. Data: ${JSON.stringify(
                {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,

                })}`);
            return res.status(200).json({
                access_token: token.access_token,
                refresh_token: token.refresh_token,
            });
        } catch (err) {
            log.error(err)
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
}
async function updateUserSession (user,token){
    const confirmTokenExpires = new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString();
    return  userService.updateUser(
        {
            _id: user._id
        },
        {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        last_login: new Date(),
        expired: confirmTokenExpires,
    })
}
const validatePasswordFields = async (newPassword, confirmPassword) => {
    if (!newPassword || !confirmPassword) {
        return errors.BAD_REQUEST_NOT_ALL_FIELD_TO_CHANGE_PASSWORD;
    }
    if (!(await passwordValidation(newPassword))) {
        return errors.BAD_REQUEST_NOT_VALID_PASSWORD;
    }

    if (newPassword !== confirmPassword) {
        return errors.BAD_REQUEST_CONFIRM_PASSWORD_NOT_VALID;
    }

    return null;
};
