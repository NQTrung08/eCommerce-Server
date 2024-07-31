'use strict';

const keyTokenModel = require('../models/keytoken.model')

class keyTokenService {
  static createKeyToken = async ({ userId, refreshToken }) => {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        refreshToken
      })

      return tokens ? tokens : null;
    } catch (error) {
      
    }
  }
}

module.exports = keyTokenService;