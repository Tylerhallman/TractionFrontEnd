const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = {
    getUserDetail: async (condition,fields) => {
        return await User.findOne(condition).select(fields);
    },
    updateUser: async (condition, data) => {
        return await User.findOneAndUpdate(condition, data, { new: true });
    },
    getUsers:async(condition)=>{
        return await User.find(condition)
    }
};