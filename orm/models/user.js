const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require('../../configs/config')

const user = new Schema({
    email: {type:String},
    password: {type:String},
    full_name: {type:String},
    phone:{type:String},
    business_address:{type:String},
    store_currency:{type:String},
    role: {
        type:Number,
        default:config.ROLES.STORE
    },
    access_token:{
        type: String,
        default:''
    },
    refresh_token:{
        type: String,
        default:''
    },
    expired:{
        type: Date,
        default: new Date()
    },
    status:{
        type:Number,
        default: config.USER_STATUS.ACTIVE
    },
    cmf_id:{
        type: String
    }
}, {
    collection: 'User',
});

module.exports = mongoose.model("User", user);
