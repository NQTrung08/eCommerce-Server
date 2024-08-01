'use strict';

const { Schema, model } = require('mongoose')

const { Key: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


var keyTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  accessTokenExpiry: { 
    type: Date,
    required: true
  },
  refreshToken: { 
    type: String, 
    required: true,
    unique: true 
  },
  refreshTokenExpiry: {
    type: Date,
    required: true
  },
}, {
  timestamps: true,
  collection: COLLECTION_NAME,
})


const keyTokenModel = model(DOCUMENT_NAME, keyTokenSchema);
// Export the model
module.exports = keyTokenModel;