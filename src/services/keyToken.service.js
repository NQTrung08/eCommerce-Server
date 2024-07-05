'use strict';


const keyTokenModel = require('../models/keytoken.model')
// create token

class keyTokenService {
  static createKeyToken = async ({ userId, privateKey, publicKey }) => {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        privateKey: privateKey,
        publicKey: publicKey,
      })

      return tokens ? tokens : null;
    } catch (error) {
      
    }
  }
}

module.exports = keyTokenService;