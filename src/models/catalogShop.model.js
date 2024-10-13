'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'CatalogShop';
const COLLECTION_NAME = 'CatalogShops';

// Mô hình ShopCategory
const CatalogShopSchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  catalog_name: {
    type: String,
    required: true
  }, 
  catalog_description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const catalogShopModel = model(DOCUMENT_NAME, CatalogShopSchema);
module.exports = catalogShopModel;
