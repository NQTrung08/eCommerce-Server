'use strict';

const { model, Schema} = require('mongoose'); // Erase if already required

const { User: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


const addressSchema = Schema({
  street: String,
  city: String,
  zipcode: String
});

// Declare the Schema of the Mongo model
var userSchema = new Schema({
  userId: { type: Number},
  userName: {
    type: String,
    trim: true,
    maxLength: 150,
    require: true
  },
  full_name: {
    type: String,
    trim: true,
    maxLength: 150,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  avatar: { 
    type: String,
    default: ''
  }, // URL of avatar
  phoneNumber: { type: String, unique: true },
  password: {
    type: String,
    required: true,
  },
  address: [addressSchema],
  status: {
    type: String,
    enum: ['active', 'pending', 'block'],
    default: 'active',
  },
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  blockedPermissions: [{ type: String }],
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  providerId: { type: String, default: ''},
  isDeleted: {
    type: Boolean,
    default: false,
  },
  lastLogin: { type: Date },
  lastPasswordReset: { type: Date },
  lastEmailChange: { type: Date },
  lastEmailVerification: { type: Date },
  lastPhoneChange: { type: Date },
}, {
  timestamps: true,
  collection: COLLECTION_NAME,

});

const userModel = model(DOCUMENT_NAME, userSchema);
//Export the model
module.exports = userModel;