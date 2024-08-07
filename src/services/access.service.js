'use strict';

const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const keyTokenService = require('./keyToken.service');
const keyTokenModel = require('../models/keytoken.model')
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils/index')

const { ConflictError, InternalServerError, BadRequestError } = require('../core/error.response');
const roleModel = require('../models/role.model');

class AccessService {

  static signUp = async ({ userName, full_name, email, phoneNumber, password, roles }) => {
    const hodelUser = await userModel.findOne({ email }).lean(); // trả về 1 object js thuần túy
    if (hodelUser) {
      throw new ConflictError('User already exists')
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const defaultRole = await roleModel.findOne({ roleName: 'user' }).lean();
    if (!defaultRole) {
      throw new InternalServerError('Default role not found');
    }

    // Create a new user
    const newUser = await userModel.create({
      userName: userName,
      full_name,
      email,
      phoneNumber,
      password: passwordHash,
      roles: [defaultRole._id], // Gán vai trò mặc định
    });

    // create token pair
    const tokens = await createTokenPair(
      {
        _id: newUser._id,
        email,
        roles: newUser.roles,
        status: newUser.status
      }

    )

    console.log("Create token success", tokens)
    console.log(tokens.refreshToken)


    const keyStore = await keyTokenService.createKeyToken({
      userId: newUser._id,
      refreshToken: tokens.refreshToken,
    })

    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }

    return {
      user: getInfoData({ fields: ['_id', 'userName', 'email', "phoneNumber", 'status', 'roles', 'provider', "providerId"], object: newUser }),
      tokens
    }

  }


  static signIn = async ({ email, password }) => {
    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      throw new ConflictError('User not found')
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new ConflictError('Invalid password')
    }

    // create token pair
    const tokens = await createTokenPair(
      {
        _id: user._id,
        email,
        roles: user.roles,
        status: user.status
      }
    )

    console.log("Create token success", tokens)

    const keyStore = await keyTokenService.createKeyToken({
      userId: user._id,
      refreshToken: tokens.refreshToken,
    })

    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }

    return {
      code: "xxx",
      metadata: {
        user: getInfoData({ fields: ['_id', 'userName', 'email', "phoneNumber", 'status', 'roles', 'provider', "providerId"], object: user }),
        tokens
      }
    }
  }


  static logOut = async ({ _id }) => {
    console.log("logOut user", _id)
    const keyToken = await keyTokenModel.deleteMany({ userId: _id })
    return keyToken;
  }

  static refreshTokenHandler = async ({ refreshToken }) => {
    console.log(refreshToken)
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }

    const tokenRecord = await keyTokenModel.findOne({ refreshToken });

    // Xác minh refreshToken
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    // Lấy thông tin người dùng và cấp phát token mới với thông tin quyền cập nhật
    const user = await userModel.findById(decoded._id).lean();
    const newAccessToken = jwt.sign({
      _id: user._id,
      email: user.email,
      roles: user.roles,
      status: user.status
    }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '3d' });

    return {
      accessToken: newAccessToken,
      refreshToken: tokenRecord.refreshToken // Có thể cấp phát refreshToken mới nếu cần
    }

  };

}

module.exports = AccessService;