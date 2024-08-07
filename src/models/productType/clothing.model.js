const { Schema, model } = require('mongoose');
const Product = require('../product.model')

const DOCUMENT_NAME = 'Clothing';
const COLLECTION_NAME = 'Clothings';

const clothingSchema = new Schema({
  size: {
    type: String,
    required: true
  },
  material: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    required: true
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const Clothing = Product.discriminator(DOCUMENT_NAME, clothingSchema);
module.exports = Clothing;
