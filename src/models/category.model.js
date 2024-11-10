'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Category'
const COLLECTION_NAME = 'Categories'

// Mô hình Category
const categorySchema = new Schema({
  category_name: {
    type: String,
    required: true
  },
  category_img: {
    type: String
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: Number,
  order: Number,
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const categoryModel = model(DOCUMENT_NAME, categorySchema);
module.exports = categoryModel;
