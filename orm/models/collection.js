const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { collection: "Collection" });

module.exports = mongoose.model("Collection", collectionSchema);