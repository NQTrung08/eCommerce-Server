'use strict';

const { Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

const discountSchema = new Schema({
  discount_shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  discount_code: {
    type: String,
    required: true
  },
  discount_name: {
    type: String,
    required: true
  },
  discount_des: {
    type: String,
    required: true
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'fixed'
  },
  discount_value: {
    type: Number,
    required: true
  },
  discount_startDate: {
    type: Date,
    required: true
  },
  discount_endDate: {
    type: Date,
    required: true
  },
  discount_max_uses: {
    type: Number,
    default: 0
  }, // so luong discount duoc su dung
  discount_used: {
    type: Number,
    default: 0
  }, // so luong discount da su dung
  discount_users_used: {
    type: Array,
    default: []
  }, // ai dung
  discount_max_uses_per_user: {
    type: Number,
    require: true,
    default: 0
  }, // moi user dùng tối đa bao nhiêu discount
  discount_min_order_value: {
    type: Number,
    default: 0,
    require: true
  }, // gia tri don hang toi thiểu
  discount_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  discount_applies_to: {
    type: String,
    enum: ['all_products', 'specific_products'],
    default: 'all_products'
  },
  discount_product_ids: {
    type: Array,
    default: []
  } // so san pham dc ap dung
}, {
  timestamps: true,
  collection: COLLECTION_NAME
  
})

const discountModel = model(DOCUMENT_NAME, discountSchema)
module.exports = discountModel