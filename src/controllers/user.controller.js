const { SuccessReponse } = require('../core/success.response');
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

module.exports = {
  verifyUserOTP,
}