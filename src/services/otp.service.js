// services/otp.service.js
const OtpModel = require('../models/otp.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const saveOTP = async (email, otp) => {
  const newOtp = new OtpModel({ email, otp });
  await newOtp.save();
  return newOtp;
};

// Hàm lấy OTP từ database (nếu cần)
const getOTPByEmail = async (email) => {
  return await OtpModel.findOne({ email });
};

// Hàm xóa OTP sau khi xác thực (nếu cần)
const deleteOTP = async (email) => {
  return await OtpModel.deleteOne({ email });
};

const verifyOTP = async (email, inputOtp) => {
  const otpRecord = await OtpModel.findOne({ email });

  if (!otpRecord || otpRecord.otp !== inputOtp) {
    throw new Error('Invalid or expired OTP');
  }

  // Xóa OTP sau khi sử dụng để đảm bảo mã chỉ dùng một lần
  await OtpModel.deleteOne({ email });

  return true;
};


const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng của email
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.log('Error sending OTP email:', error);
  }
};


const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP gồm 6 chữ số
};


module.exports = {
  saveOTP,
  getOTPByEmail,
  deleteOTP,
  verifyOTP,
  sendOTPEmail,
  generateOTP,
};
