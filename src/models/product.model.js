'use strict';

const { Schema, model } = require('mongoose');

const { Product: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

const productSchema = new Schema({
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: {
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
  quantity: {
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
  thumb: {
    type: [String],
    default: []
  },
  attributes: {
    type: Schema.Types.Mixed
  }
  
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const productModel = model(DOCUMENT_NAME, productSchema);
module.exports = productModel;
