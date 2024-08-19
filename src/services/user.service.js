const { verifyOTP, deleteOTP } = require('../services/otp.service');
const UserModel = require('../models/user.model');
const { BadRequestError, InternalServerError } = require('../core/error.response');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData, createTokenForUser } = require('../utils');

const verifyUserOTP = async ({
  email,
  otp,
}) => {
  try {

    // Xác thực OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      throw new BadRequestError('Invalid OTP');
    }

    // Cập nhật tài khoản thành đã xác thực
    await UserModel.updateOne({ email }, {
      $set: {
        status: 'active',
        verifiedEmail: true,
      },
    });

    // Xóa OTP sau khi xác thực thành công
    await deleteOTP(email);

    // Tạo token JWT cho phiên đăng nhập
    const newUser = await UserModel.findOne({ email });
    const tokens = await createTokenForUser(newUser)

    const keyStore = await keyTokenService.createKeyToken({
      userId: newUser._id,
      refreshToken: tokens.refreshToken,
    })

    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }

    return {
      user: getInfoData({ fields: ['_id', 'userName', 'avatar', 'email', "phoneNumber", 'status', 'verifiedEmail', 'roles', 'provider', "providerId"], object: newUser }),
      tokens
    }
  } catch (error) {
    console.error('[E]::verifyUserOTP::', error);
    throw error;
  }
};

module.exports = {
  verifyUserOTP,
};
