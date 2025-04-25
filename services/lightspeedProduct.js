const mongoose = require('mongoose');

const LightspeedProduct = mongoose.model('LightspeedProduct');

module.exports = {

    createProduct: async (data) => {
        return await LightspeedProduct.create(data);
    },
    deleteProducts:async(condition)=>{
        return await LightspeedProduct.deleteMany(condition)
    },
    getProducts:async(data)=>{
        return await LightspeedProduct.find(data)
            .populate('product_organization.category')
            .populate('product_organization.type');
    },
    getProduct:async(data)=>{
        return await LightspeedProduct.findOne(data)
            .populate('product_organization.category')
            .populate('product_organization.type');
    },
};