
'use strict';
const { Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'Property'
const COLLECTION_NAME = 'Properties'

const propertySchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  properties: {type: Schema.Types.Mixed}
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const Property = model(DOCUMENT_NAME, propertySchema)

module.exports = Property