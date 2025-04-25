const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { collection: "Type" });

module.exports = mongoose.model("Type", typeSchema);