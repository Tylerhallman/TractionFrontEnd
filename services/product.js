const mongoose = require('mongoose');

const Product = mongoose.model('Product');

module.exports = {

    createProduct: async (data) => {
        return await Product.create(data);
    },
    getProduct:async(data)=>{
        return await Product.findOne(data)
            .populate('product_organization.category')
            .populate('product_organization.type');
    },
    getProducts:async(data)=>{
        return await Product.find(data)
            .populate('product_organization.category')
            .populate('product_organization.type');
    },
    updateProduct:async(data,condition)=>{
        return await Product.updateOne(condition,{$set:data})
    },
    deleteProduct:async(condition)=>{
        return await Product.deleteOne(condition)
    },
    updateMany: async(condition,data)=>{
        return await Product.updateMany(condition,data)
    }

};