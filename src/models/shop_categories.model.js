'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'ShopCategory';
const COLLECTION_NAME = 'ShopCategories';

// Mô hình ShopCategory
const shopCategorySchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const shopCategoryModel = model(DOCUMENT_NAME, shopCategorySchema);
module.exports = shopCategoryModel;
