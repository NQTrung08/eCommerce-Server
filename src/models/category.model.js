'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Category'
const COLLECTION_NAME = 'Categories'

// Mô hình Category
const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const categoryModel = model(DOCUMENT_NAME, categorySchema);
module.exports = categoryModel;
