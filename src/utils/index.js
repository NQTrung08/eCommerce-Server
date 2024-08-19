'use strict';

const _ = require('lodash');
const { createTokenPair, createAccessToken } = require('../auth/authUtils');

const getInfoData = ({fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const createTokenForUser = async(Object) => {
  const tokens = await createTokenPair({
    _id: Object._id,
    userName: Object.userName,
    avatar: Object.avatar,
    phoneNumber: Object.phoneNumber,
    email: Object.email,
    roles: Object.roles,
    status: Object.status,
    verifiedEmail: Object.verifiedEmail
  });

  return tokens;
}

const createAccessTokenForUser = async(object) => {
  const tokens = await createAccessToken({
    _id: object._id,
    userName: object.userName,
    avatar: object.avatar,
    email: object.email,
    phoneNumber: object.phoneNumber,
    roles: object.roles,
    status: object.status,
    verifiedEmail: object.verifiedEmail
  });

  return tokens;
}

module.exports = {
  getInfoData,
  createTokenForUser,
  createAccessTokenForUser
}