'use strict';

const keyTokenModel = require('../models/keytoken.model')

class keyTokenService {
  static createKeyToken = async ({ userId, accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry }) => {
    try {
      const tokens = await keyTokenModel.create({
        userId: userId,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiry: accessTokenExpiry,
        refreshTokenExpiry: refreshTokenExpiry,
        
      })

      return tokens ? tokens : null;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = keyTokenService;