const { BadRequestError } = require('../core/error.response');
const { SuccessReponse } = require('../core/success.response');
const shopModel = require('../models/shop.model');
const UserService = require('../services/user.service');

const verifyUserOTP = async (req, res, next) => {
  console.log(req.body.email)
  return new SuccessReponse({
    message: 'User verify successfully',
    data: await UserService.verifyUserOTP({
      email: req.body.email,
      otp: req.body.otp,
    }),
  }).send(res)
};

const getAllUsers = async (req, res, next) => {
  return new SuccessReponse({
    message: 'All users',
    data: await UserService.getAllUsers(),
  }).send(res)
};

const getCustomers = async (req, res, next) => {
  const id = req.user._id

  const shop = await shopModel.findOne({
    owner_id: id
  })

  if (!shop) {
    throw new BadRequestError('Shop not found for the owner');
  }

  return new SuccessReponse({
    message: 'All customers',
    data: await UserService.getCustomers({
      shop_id: shop._id
    }),
  }).send(res)
};

const blockUser = async (req, res, next) => {
  const userId = req.body.userId
  return new SuccessReponse({
    message: 'User blocked successfully',
    data: await UserService.blockUser({ userId }),
  }).send(res)
};

module.exports = {
  verifyUserOTP,
  getAllUsers,
  getCustomers,
  blockUser
}