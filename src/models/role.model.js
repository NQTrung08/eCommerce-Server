
const { Schema, model} = require('mongoose')

const { Role: { DOCUMENT_NAME, COLLECTION_NAME } } = require('../constant/index')


const roleSchema = new Schema({
  roleName: { type: String, default: 'user', enum: ['user', 'shop', 'admin']},
  roleSlug: { type: String},
  roleStatus: { type: String, default: 'active', enum: [ 'active', 'block', 'pending']},
  roleDesc: {type: String},
  rol_grants: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      resource: { type: Schema.Types.ObjectId, ref: 'Resource'},
      actions: [{type: String}],
      attributes: { type: String, default: '*'}
    }
  ]
},
{
  timestamps: true,
  collection: COLLECTION_NAME
});

const roleModel = model(DOCUMENT_NAME, roleSchema);

module.exports = roleModel
