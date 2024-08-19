// controllers/auth.controller.js
const { SuccessReponse } = require('../core/success.response');
const OTPService = require('../services/otp.service');

const requestOTP = async (req, res) => {
  const { email } = req.body;
  
  // Send OTP to user's email
  const otp = await OTPService.sendOTPEmail(email);

  return new SuccessReponse({
    message: 'OTP sent to your email',
    data: otp
  }).send(res)
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
    // Verify OTP
    await OTPService.verifyOTP(email, otp);

    return new SuccessReponse({
      message: 'OTP verified successfully',
      data: OTPService
    }).send(res)
};

module.exports = {
  requestOTP,
  verifyOTP,
}

