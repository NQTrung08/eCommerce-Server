'use strict';

const { Schema, model } = require('mongoose');

const { Product: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

const productSchema = new Schema({
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productThumb: {
    type: String,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true
  },
  stockStatus: {
    type: String,
    enum: ['inStock', 'outOfStock', 'preOrder'],
    default: 'inStock'
  },
  unit: {
    type: String,
    enum: ['kilogram', 'pieces', 'boxes'],
    default: 'pieces'
  },
  description: {
    type: String,
    default: ''
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  productVariations: {
    type: [{
      variationName: String,
      variationPrice: Number,
      variationStock: Number,
      variationThumb: String,
      variationImages: [String]
    }],
    default: []
  },
  attributes: {
    type: Schema.Types.Mixed
  },
  isDraft: {
    type: Boolean,
    default: true,
    index: true,
    select: false
  },
  isPublic: {
    type: Boolean,
    default: false,
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
  discriminatorKey: 'productType'
});

const productModel = model(DOCUMENT_NAME, productSchema);
module.exports = productModel;
