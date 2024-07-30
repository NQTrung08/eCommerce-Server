'use strict';

const { model, Schema} = require('mongoose'); // Erase if already required

const { User: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')

// Declare the Schema of the Mongo model
var userSchema = new Schema({
  userId: { type: Number},
  userName: {
    type: String,
    trim: true,
    maxLength: 150,
    require: true
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
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
}, {
  timestamps: true,
  collection: COLLECTION_NAME,

});

const userModel = model(DOCUMENT_NAME, userSchema);
//Export the model
module.exports = userModel;