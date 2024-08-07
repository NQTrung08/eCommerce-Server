'use strict';

const keyTokenModel = require('../models/keytoken.model')

class keyTokenService {
  static createKeyToken = async ({ userId, refreshToken }) => {
    try {
      const tokens = await keyTokenModel.create({
        userId: userId,
        refreshToken: refreshToken
        
      })

      return tokens ? tokens : null;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = keyTokenService;