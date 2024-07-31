const {Schema, model} = require('mongoose');

const { Resource: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


const resourceSchema = new Schema({
  resourceName: { type: String, required: true},
  resourceSlug: { type: String},
  resourceDesc: { type: String, required: true }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});
const resourceModel = model(DOCUMENT_NAME, resourceSchema);

module.exports = resourceModel;
