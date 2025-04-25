const config = require('../configs/config')
const mongoose = require('mongoose');

require('./models/user')
require('./models/product')
require('./models/type')
require('./models/category')
require('./models/upload')
require('./models/customer')
require('./models/lightspeedProducts')

module.exports ={
    async connectDb(){
        try {
            await mongoose.connect(config.MONGO_URL, {
                user: config.MONGO_USER,
                pass: config.MONGO_PASSWORD,
                dbName: config.MONGO_DB,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            return true
        } catch (ex) {
            throw ex;
        }
    }
}
