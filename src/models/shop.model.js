'use strict';

const { model, Schema} = require('mongoose'); // Erase if already required

const { Shop: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

// Declare the Schema of the Mongo model
var shopSchema = new Schema({
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shop_name: {
    type: String,
    trim: true,
    maxLength: 150,
  },
  logo: { type: String }, // URL của logo
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  
}, {
  timestamps: true,
  collection: COLLECTION_NAME,

});

const shopModel = model(DOCUMENT_NAME, shopSchema);
//Export the model
module.exports = shopModel;