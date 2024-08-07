'use strict'

const { Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'

const commentSchema = new Schema({
  comment_productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  comment_userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment_content: {
    type: String,
    default: 'text'
  },
  comment_left: {
    type: Number,
    default: 0
  },
  comment_right: {
    type: Number,
    default: 0
  },
  comment_parentId: {
    type: Schema.Types.ObjectId,
    ref: DOCUMENT_NAME,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME

})

const commentModel = model(DOCUMENT_NAME, commentSchema)

module.exports = commentModel
