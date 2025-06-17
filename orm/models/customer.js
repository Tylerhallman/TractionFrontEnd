const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    language:{ type: String, required: false },
    phone:{ type: String, required: true },
    email:{ type: String, required: true },
    address:Object,
    notes:[Object],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { collection: "Customer" });

module.exports = mongoose.model("Customer", customerSchema);