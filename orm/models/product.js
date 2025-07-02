const mongoose = require('mongoose');
const config = require('../../configs/config')

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    media: [
        Object
    ],
    pricing: {
        price: { type: Number,required:true },
        sale_price: { type: Number }
    },
    include_feels: {
        type: Boolean,
        default: false
    },
    doc: { type: Number },
    freight: { type: Number },
    setup: { type: Number },
    cost_per_item: { type: Number },
    profit: { type: Number },
    margin: { type: Number },
    status: { type: Number,default: config.PRODUCT_STATUSES.DRAFT },
    published: {
        online_store: { type: Boolean },
        facebook_page: { type: Boolean },
        facebook_marketplace: { type: Boolean }
    },
    product_organization: {
        search: { type: String },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        vendor: {
            type: String,
        },
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Type',
        }
    },
    stock_number:{
      type: String
    },
    quantity:{
      type: Number
    },
    identifier:{
      type: String,
    },
    is_math:{
      type: Boolean,
        default: false
    },
    created_at:{
      type: Date,
      default: new Date()
    },
    lightspeed_status:{
      type: String,
        default:'out of stock'
    },
    year:{
        type:String,
    },
    make:{
        type:String,
    },
    model:{
        type:String,
    },
    vin:{
        type: String,
    },
    condition:{
        type: String,
    },
    callouts:{
        type:String,
    },
    banner_content:{
        type: String
    },
    feature:{
        type: String,
    },
    tech_specs:{
        type: String,
    },
    warranty_content:{
        type: String
    },
    warranty_link:{
        type: String,
    },
    gallery_1:{
        type: Object,
    },
    attributes: [{
        key: String,
        value: String
    }],
    gallery_2:{
        type: Object,
    },
    gallery_3:{
        type: Object,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { collection: "Product" });

module.exports = mongoose.model("Product", productSchema);