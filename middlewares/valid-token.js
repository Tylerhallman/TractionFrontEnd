const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const userService = require('../services/user');

module.exports = async (req, res, next) => {
    try {
        const token = req.get('Authorization');
        if (!token) {
            return res.status(401).json({
                message: 'The access token is not provided',
                errCode: 401,
            });
        }
        try {
            jwt.verify(token, config.JWT_SECRET_USER);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                const user = await userService.getUserDetail({ access_token: token },'_id role refresh_token');
                if (user && user.refresh_token) {
                    const newAccessToken = jwt.sign(
                        { _id: user._id, role: user.role },
                        config.JWT_SECRET_USER,
                        { expiresIn: config.ACCESS_TOKEN_LIFETIME }
                    );
                    await userService.updateUser(
                        { _id: user._id },
                        { access_token: newAccessToken },
                    );

                    res.setHeader('Authorization', newAccessToken);
                    req.userid = user.id;
                    req.role = user.role;
                    return next();
                } else {
                    return res.status(401).json({
                        message: 'Access token expired and refresh token is missing or invalid',
                        errCode: 4014,
                    });
                }
            }
            return res.status(401).json({
                message: 'The access_token provided is invalid',
                errCode: 4013,
            });
        }

        const user = await userService.getUserDetail({access_token: token });
        if (!user) {
            return res.status(401).json({
                message: 'The access_token provided is invalid',
                errCode: 4012,
            });
        }
        req.user = {
            user_id: user.id,
            role: user.role
        }
        res.setHeader('Authorization', token);

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'An error occurred while verifying the access token',
            errCode: 5001,
            error: error.message,
        });
    }
};