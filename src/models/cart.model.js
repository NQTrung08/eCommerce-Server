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
  cart_products: {
    type: Array,
    default: [],
    required: true
  },
  /**
    [
      {
        productId,
        shopId,
        quantity,
        price,
        product_name,
        product_desc,
      }
    ]
   */
  cart_state: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const cartModel = model(DOCUMENT_NAME, cartSchema)
module.exports = cartModel