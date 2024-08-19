// models/otp.model.js
const mongoose = require('mongoose');

const DOCUMENT_NAME = 'OTP'
const COLLECTION_NAME = 'OTPs'

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // Đảm bảo rằng TTL index được thiết lập
}, {
  collection: COLLECTION_NAME,
});


const OtpModel = mongoose.model(DOCUMENT_NAME, otpSchema);

module.exports = OtpModel;
