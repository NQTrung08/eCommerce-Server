'use strict';

const { Schema, model } = require('mongoose')

const { Key: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


var keyTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Shop'
  },
  privateKey: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  refreshToken: {
    type: Array,
    default: []
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME,
})


const keyTokenModel = model(DOCUMENT_NAME, keyTokenSchema);
// Export the model
module.exports = keyTokenModel;