const { Schema, Types, model } = require('mongoose');
const DOCUMENT_NAME = 'Transaction'
const COLLECTION_NAME = 'Transactions'

const transactionSchema = new Schema({
  transaction_id: {
    type: String,
    required: true,
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  bankCode: {
    type: String,
  },
  transactionNo: {
    type: String,
  },
  responseCode: {
    type: String,
  },
  transactionStatus: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  collection: COLLECTION_NAME,
  timestamps: true,
});

const transactionModel = model(DOCUMENT_NAME, transactionSchema);
module.exports = transactionModel
