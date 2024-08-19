// models/otp.model.js
const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Template'
const COLLECTION_NAME = 'Templates'

const templateSchema = new mongoose.Schema({
  tem_name: { type: String, required: true },
  tem_subject: { type: String},
  tem_status: { type: String, default: 'active'},
  tem_html: { type: String},
}, {
  collection: COLLECTION_NAME,
  timestamps: true,
});

const templateModel = mongoose.model(DOCUMENT_NAME, templateSchema);

module.exports = templateModel;
