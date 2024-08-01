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
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  avatar: { type: String }, // URL of avatar
  phoneNumber: { type: String, unique: true },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'block'],
    default: 'active',
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  blockedPermissions: [{ type: String }],
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  providerId: { type: String, default: ''}
}, {
  timestamps: true,
  collection: COLLECTION_NAME,

});

const userModel = model(DOCUMENT_NAME, userSchema);
//Export the model
module.exports = userModel;