'use strict';

const { Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const cartSchema = new Schema({
  cart_userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart_items: {
    type: Array,
    default: []
  },
  cart_count_product: {
    type: Number,
    default: 0
  },
  cart_total_price: {
    type: Number,
    default: 0
  },
  cart_state: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const Cart = model(DOCUMENT_NAME, cartSchema)
module.exports = Cart