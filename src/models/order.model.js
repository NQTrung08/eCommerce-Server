'use strict';
const { Schema, model} = require('mongoose');

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderProductSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  product_thumb: {
    type: String,
    required: true
  }
})

const orderSchema = new Schema({
  order_userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_trackingNumber: {
    type: String,
    default: 't3g03996667738'

  },
  order_products: [orderProductSchema],
  order_status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  order_payment_method: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  order_total_price: {
    type: Number,
    required: true
  },
  order_shipping_address: {
    type: String,
    required: true
  },
  order_shipping_fee: {
    type: Number,
    default: 0
  },
  order_payment_gateway: {
    type: String,
    default: ''
  },
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const Order = model(DOCUMENT_NAME, orderSchema)
module.exports = Order