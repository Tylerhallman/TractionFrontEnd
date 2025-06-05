const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema  = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    homepageEntryId: {type:String},
    typesEntryId: {type:String},
    newsEntryId:{type:String},
}, {
    collection: 'Content',
});

module.exports = mongoose.model("Content", contentSchema );
