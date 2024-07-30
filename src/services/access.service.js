'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils/index')

const { RoleShop: { SHOP, WRITE, EDITOR, ADMIN } } = require('../constant/index');
const { ConflictError, InternalServerError } = require('../core/error.response');

class AccessService {

  static signUp = async ({ name, email, password }) => {
    // try {
      // Check if user already exists
      const hodelShop = await shopModel.findOne({ email }).lean(); // trả về 1 object js thuần túy
      if (hodelShop) {
        throw new ConflictError('User already exists')
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create a new user
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [SHOP],
      });


      // TODO: Add user to authentication service (JWT, Firebase Auth, etc.)
      if (newShop) {
        // Create random tokens
        const privateKey = crypto.randomBytes(32).toString('hex');
        const publicKey = crypto.randomBytes(32).toString('hex');



        const keyStore = await keyTokenService.createKeyToken({
          userId: newShop._id,
          privateKey: privateKey,
          publicKey: publicKey,
        })

        if (!keyStore) {
          throw new InternalServerError('Failed to save keyStore')
        }
    
        // create token pair
        const tokens = await createTokenPair(
          {
            userId: newShop._id,
            email
          },
          publicKey,
          privateKey
        )

        console.log("Create token success", tokens)

        return {
          code: "xxx",
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email',], object: newShop }),
            tokens
          }
        }

      }
      // trả về nếu create user thành công như không thể create token
      throw new InternalServerError('Failed to create user');

      // TODO: Send verification email
    // } catch (error) {
    //   console.error('Error signing up:', error);
    //   return {
    //     code: 'xxx',
    //     message: error.message,
    //     status: 'error'
    //   }
    // }
  }
}

module.exports = AccessService;