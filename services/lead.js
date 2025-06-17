const mongoose = require('mongoose');

const Lead = mongoose.model('Lead');

module.exports = {

    createLead: async (data) => {
        return await Lead.create(data);
    },
    getLead:async(data)=>{
        return await Lead.findOne(data)
    },
    getAllLeads:async(data)=>{
        return await Lead.find(data)
    },
    deleteLead:async(data)=>{
        return await Lead.deleteOne(data)
    },
    updateLead:async(data,condition)=>{
        return await Lead.updateOne(condition,{$set:data})
    },
    getCount:async(condition)=>{
        return await Lead.countDocuments(condition)
    }

};