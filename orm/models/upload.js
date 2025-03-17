const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    path: { type: String},
    type: { type: String},
    name: { type: String},
    size: { type: Number },
    createdAt: { type: Date, default: Date.now }
}, { collection: "Upload" });

module.exports = mongoose.model("Upload", uploadSchema);