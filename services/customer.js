const mongoose = require('mongoose');

const Customer = mongoose.model('Customer');

module.exports = {

    createCustomer: async (data) => {
        return await Customer.create(data);
    },
    getCustomer:async(data)=>{
        return await Customer.findOne(data)
    },
    updateCustomer: async(data,condition)=>{
        return await Customer.updateOne(condition,{$set:data})
    },
    getCustomers:async(data)=>{
        return await Customer.find(data)
    },
    deleteCustomer:async(data)=>{
        return await Customer.deleteOne(data)
    }


};