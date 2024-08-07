'use strict';

const { Schema } = require('mongoose');
const Product = require('../product.model');

const electronicsSchema = new Schema({
  warranty: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    required: true
  }
});

const Electronics = Product.discriminator('Electronics', electronicsSchema);
module.exports = Electronics;
