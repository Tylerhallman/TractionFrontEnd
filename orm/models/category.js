const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Type",
        required:true
    }
}, { collection: "Category" });

module.exports = mongoose.model("Category", categorySchema);