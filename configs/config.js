require('dotenv').config();

module.exports ={
    MONGO_URL: process.env.mongo_url ,
    MONGO_USER : process.env.mongo_user ,
    MONGO_PASSWORD: process.env.mongo_password ,
    MONGO_DB: process.env.mongo_db ,

    JWT_SECRET_USER:process.env.access_token_secret,
    JWT_REFRESH_SECRET_USER: process.env.refresh_token_secret,

    ACCESS_TOKEN_LIFETIME:process.env.access_token || '600m',
    REFRESH_TOKEN_LIFETIME:process.env.refresh_token || '600m',

    LIGHTSPEED_BASE_URL: process.env.lightspeed_base_url,
    LIGHTSPEED_API_KEY : process.env.lightspeed_api_key,
    LIGHTSPEED_API_SECRET : process.env.lightspeed_api_secret,

    ROLES:{
        STORE:1
    },
    USER_STATUS:{
        ACTIVE:1,
        DEACTIVATE:2
    },
    PRODUCT_STATUSES:{
        ACTIVE:1,
        DRAFT:2,
        ARCHIVED:3
    }
}