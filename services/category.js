const mongoose = require('mongoose');

const Category = mongoose.model('Category');

module.exports = {

    createCategory: async (data) => {
        return await Category.create(data);
    },
    findCategoryOrCreate:async(data,)=>{
        let category = await Category.findOne(data).lean();
        if(!category) category = await Category.create(data)
        return category
    },
    getCategories: async (data, filter) => {
        let query = { ...data };

        if (filter) {
            query.title = { $regex: filter, $options: 'i' };
        }

        return  await Category.find(query);
    }

};