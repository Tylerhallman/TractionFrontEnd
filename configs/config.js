require('dotenv').config();

module.exports ={

    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_ANON: process.env.MAIL_ANON || false,
    MAIL_SECURE: process.env.MAIL_SECURE || false,
    MAIL_TLS: process.env.MAIL_TLS || true,
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,

    MONGO_URL: process.env.MONGO_URL ,
    MONGO_USER : process.env.MONGO_USER ,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD ,
    MONGO_DB: process.env.MONGO_DB ,

    JWT_SECRET_USER:process.env.ACCESS_TOKEN_SECRET,
    JWT_REFRESH_SECRET_USER: process.env.REFRESH_TOKEN_SECRET,


    ACCESS_TOKEN_LIFETIME:process.env.ACCESS_TOKEN || '600m',
    REFRESH_TOKEN_LIFETIME:process.env.REFRESH_TOKEN || '600m',

    LIGHTSPEED_BASE_URL: process.env.LIGHTSPEED_BASE_URL,
    LIGHTSPEED_API_KEY : process.env.LIGHTSPEED_API_KEY,
    LIGHTSPEED_API_SECRET : process.env.LIGHTSPEED_API_SECRET,

    CONTENTFUL_MANAGEMENT_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT,

    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

    CRON_TOKEN: process.env.CRON_TOKEN,

    CRYPTO_SECRET: process.env.CRYPTO_SECRET,

    FRONT_URL:process.env.FRONT_URL,

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
    },


    REGEX_PHONE : /^[\d\s\-()+]{6,20}$/,
    REGEX_EMAIL: /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    REGEX_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    MAIL_DEFAULT_REPLY:'Traction' + '<' + `${process.env.MAIL_USERNAME}` + '>'

}