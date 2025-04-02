const mongoose = require('mongoose');

const LightspeedProduct = mongoose.model('LightspeedProduct');

module.exports = {

    createProduct: async (data) => {
        return await LightspeedProduct.create(data);
    },
    deleteProducts:async(condition)=>{
        return await LightspeedProduct.deleteMany(condition)
    },
};