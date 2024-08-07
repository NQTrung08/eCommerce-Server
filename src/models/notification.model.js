const {Schema , model} = require('mongoose')

const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'


const notificationSchema = new Schema({
  noti_type: {
    type: String,
    enum: ['ORDER', 'PROMOTION', 'SYSTEM', 'OTHERS'],
    required: true
  },
  noti_senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'noti_senderType'    
  },
  noti_senderType: {
    type: String,
    enum: ['User', 'Shop'],
    required: true
  },
  noti_receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  noti_content: {
    type: String,
    required: true
  },
  noti_options: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

const Notification = model(DOCUMENT_NAME, notificationSchema);
module.exports = Notification;