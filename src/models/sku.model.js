'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME =  'SKU'
const COLLECTION_NAME = 'SKUS'

const skuSchema = new Schema({
  // sku_id: {type: String, unique: true}, // {spu_id}1223124-{shop_id}
  // sku_tier_idx: {
  //   type: Array,
  //   default: [0]
  // }, // [1,0]

  /**
   * color = [red, green] = [0, 1]
   * size = [S, M] = [0, 1]
   * 
   * => red + S = [0, 0]
   * => red + L = [0, 1]
   */
  sku_code: {type: String},
  // sku_sort: {type: Number, default: 0},
  sku_price: {type: Number, require: true},
  sku_stock: {type: Number, default: 0},
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }, // ref to product
  options: [{
    name: { type: String, required: true },  // Tên của thuộc tính, ví dụ: "color", "size"
    value: { type: String, required: true },  // Giá trị của thuộc tính, ví dụ: "red", "M"
    image: { type: String }  // Đường dẫn hoặc URL của hình ảnh tùy chọn cho giá trị này
  }],
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
  }

}, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

const skuModel = model(DOCUMENT_NAME, skuSchema);
module.exports = skuModel;