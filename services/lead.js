const mongoose = require('mongoose');

const Lead = mongoose.model('Lead');

module.exports = {

    createLead: async (data) => {
        return await Lead.create(data);
    }
};