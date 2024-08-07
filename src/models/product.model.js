'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const { Product: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

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
  product_thumb: {
    type: String,
    required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  product_price: {
    type: Number,
    required: true
  },
  stock_status: {
    type: String,
    enum: ['inStock', 'outOfStock', 'preOrder'],
    default: 'inStock'
  },
  product_desc: {
    type: String,
    default: ''
  },
  product_slug: {
    type: String,
  },
  // product_variations: {
  //   type: Array,
  //   default: []
  // },
  /**
   * variations: [
   *  {
   *
   *    name: 'color',
   *     options: ['red', 'green', 'blue']   
   *  
   *  },
   *  {
   *     image: [],
   *     name: 'size',
   *     options: ['S', 'M'],
   *   }
   * ]
   * 
   */
  attributes: {
    type: Schema.Types.Mixed
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
  }

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
