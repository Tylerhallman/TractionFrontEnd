const mongoose = require('mongoose');

const Type = mongoose.model('Type');

module.exports = {

    createType: async (data) => {
        return await Type.create(data);
    },
    getType: async (data, filter) => {
        let query = { ...data };

        if (filter) {
            query.title = { $regex: filter, $options: 'i' };
        }

        return  await Type.find(query);
    }
};