'use strict';

const { Schema } = require('mongoose');
const Product = require('../product.model');

const furnitureSchema = new Schema({
  material: {
    type: String,
    required: true
  },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  weight: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    default: ''
  }
});

const Furniture = Product.discriminator('Furniture', furnitureSchema);
module.exports = Furniture;
