'use strict';

const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils/index')

const { RoleName: { USER } } = require('../constant/index');
const { ConflictError, InternalServerError } = require('../core/error.response');

class AccessService {

  static signUp = async ({ name, email, phoneNumber, password }) => {
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
      userName: name,
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


    const keyStore = await keyTokenService.createKeyToken({
      userId: newUser._id,
      refreshToken: tokens.refreshToken
    })

    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }

    return {
      code: "xxx",
      metadata: {
        user: getInfoData({ fields: ['_id', 'userId', 'userName', 'email', 'status', 'roles', 'provider'], object: newUser }),
        tokens
      }
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
      refreshToken: tokens.refreshToken
    })

    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }

    return {
      code: "xxx",
      metadata: {
        user: getInfoData({ fields: ['_id', 'userId', 'userName', 'email', 'status', 'roles', 'provider'], object: newShop }),
        tokens
      }
    }
  }
}

module.exports = AccessService;