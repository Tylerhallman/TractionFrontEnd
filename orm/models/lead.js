const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    how_did: { type: String, required: false },
    description: { type: String, required: false },
    subscribe: { type: Boolean, required: false },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product:{
        type: Object
    },
    created_at:{
        type: Date,
        default: Date.now
    }
}, { collection: "Lead",strict: false });

module.exports = mongoose.model("Lead", leadSchema);