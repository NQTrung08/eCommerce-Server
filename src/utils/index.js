'use strict';

const _ = require('lodash');
const { createTokenPair, createAccessToken } = require('../auth/authUtils');
const roleModel = require('../models/role.model');
const mongoose = require('mongoose');
const { BadRequestError } = require('../core/error.response');
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const createTokenForUser = async (Object) => {

  const roles = await roleModel.find({ _id: { $in: Object.roles } });
  const roleNames = roles.map((role) => { return role.roleName })
  const tokens = await createTokenPair({
    _id: Object._id,
    userName: Object.userName,
    avatar: Object.avatar,
    phoneNumber: Object.phoneNumber,
    email: Object.email,
    roles: Object.roles,
    roleNames: roleNames,
    status: Object.status,
    verifiedEmail: Object.verifiedEmail
  });

  return tokens;
}

const createAccessTokenForUser = async (object) => {
  const roles = await roleModel.find({ _id: { $in: object.roles } });
  const roleNames = roles.map((role) => { return role.roleName })
  const tokens = await createAccessToken({
    _id: object._id,
    userName: object.userName,
    avatar: object.avatar,
    email: object.email,
    phoneNumber: object.phoneNumber,
    roles: object.roles,
    roleNames: roleNames,
    status: object.status,
    verifiedEmail: object.verifiedEmail
  });

  return tokens;
}

const convertToObjectId = (id) => {
  // Kiểm tra nếu id không hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  
  // Trả về ObjectId
  return new mongoose.Types.ObjectId(id);
};

module.exports = {
  getInfoData,
  createTokenForUser,
  createAccessTokenForUser,
  convertToObjectId,
}