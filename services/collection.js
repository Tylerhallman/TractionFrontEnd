const mongoose = require('mongoose');

const Collection = mongoose.model('Collection');

module.exports = {

    createCollection: async (data) => {
        return await Collection.create(data);
    },
    getCollections: async (data, filter) => {
        let query = { ...data };

        if (filter) {
            query.title = { $regex: filter, $options: 'i' };
        }

        return  await Collection.find(query);
    }
};