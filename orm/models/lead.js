const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    how_did: { type: String, required: true },
    description: { type: String, required: false },
    subscribe: { type: Boolean, required: false },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product:{
        type: Object
    }
}, { collection: "Lead" });

module.exports = mongoose.model("Lead", leadSchema);