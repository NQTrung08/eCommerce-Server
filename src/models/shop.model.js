'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const { Shop: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

// Declare the Schema of the Mongo model
var shopSchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxLength: 150,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  verify: {
    type: Schema.Types.Boolean,
    default: false,
  },
  roles: {
    type: Array,
    default: [],
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME,

});

const shopModel = model(DOCUMENT_NAME, shopSchema);
//Export the model
module.exports = shopModel;