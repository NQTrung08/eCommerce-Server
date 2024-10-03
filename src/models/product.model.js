'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const { Product: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


// const skuSchema = new mongoose.Schema({
//   skuId: { type: String, required: true },    // Mã SKU duy nhất
//   attributes: { type: Map, of: String },      // Thuộc tính như color, size, model, version
//   price: { type: Number, required: true },    // Giá của SKU
//   stock: { type: Number, required: true },    // Số lượng tồn kho của SKU
//   images: [{ type: String }],                 // Mảng chứa các link hình ảnh của SKU
// });

const productSchema = new Schema({
  // product_id: {type: String, default: ''},
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },

  product_img: [{ type: String}] ,
  product_thumb: {
    type: String,
    // required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // skus: [
  //   skuSchema
  // ],
  product_desc: {
    type: String,
    default: ''
  },
  product_slug: {
    type: String,
  },
  product_price: {
    type: Number,
    required: true,
  },
  product_quantity: {
    type: Number,
    required: true,
  },
  product_unit: {
    type: String,
    // required: true,
  },
  properties: {
    type: Schema.Types.Mixed,
  },
  isDraft: {
    type: Boolean,
    default: false,
    index: true,
    select: false
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true,
    select: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  stock_status: {
    type: String,
    enum: ['inStock', 'outOfStock', 'preOrder'],
    default: 'inStock'
  },


}, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

productSchema.index({ product_name: 'text', product_desc: 'text' })

productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

const productModel = model(DOCUMENT_NAME, productSchema);
module.exports = productModel;
