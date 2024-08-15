// controllers/auth.controller.js
const { SuccessReponse } = require('../core/success.response');
const OTPService = require('../services/otp.service');

const requestOTP = async (req, res) => {
  const { email } = req.body;
  
  // Generate OTP
  const otp = OTPService.generateOTP();

  // Save OTP to database
  await OTPService.saveOTP(email, otp);

  // Send OTP to user's email
  await OTPService.sendOTPEmail(email, otp);

  new SuccessReponse({
    message: 'OTP sent to your email',
    data: { otp }
  })
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
    // Verify OTP
    await OTPService.verifyOTP(email, otp);

    new SuccessReponse({
      message: 'OTP verified successfully',
      data: OTPService
    })
};

module.exports = {
  requestOTP,
  verifyOTP,
}

