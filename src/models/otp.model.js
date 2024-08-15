// models/otp.model.js
const mongoose = require('mongoose');

const DOCUMENT_NAME = 'OTP'
const COLLECTION_NAME = 'OTPs'

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String},
  otp_token: { type: String},
  otp_status: { type: String, default: 'pending', enum: ['pending', 'active', 'block']},
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP sẽ hết hạn sau 5 phút
}, {
  collection: COLLECTION_NAME,
  timestamps: true,
});

const OtpModel = mongoose.model(DOCUMENT_NAME, otpSchema);

module.exports = OtpModel;
