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
    // required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  attributes: [
    {
      name: {
        type: String,
        required: true,
      },
      values: [
        {
          type: String,
          required: true,
        }
      ]
    }
  ],
  skus: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SKU',
    }
  ],
  product_desc: {
    type: String,
    default: ''
  },
  product_slug: {
    type: String,
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
