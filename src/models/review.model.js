'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Review';
const COLLECTION_NAME = 'Reviews';

const reviewSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const reviewModel = model(DOCUMENT_NAME, reviewSchema);
module.exports = reviewModel;
