// services/otp.service.js
const OtpModel = require('../models/otp.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { BadRequestError, InvalidError } = require('../core/error.response');
const { getTemplate } = require('./template.service');
const transporter = require('../dbs/init.nodemailer');


const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP gồm 6 chữ số
};

const newOTP = async (email) => {
  // Tạo mã OTP mới
  const otp = generateOTP();
  const newOtp = new OtpModel({
    email,
    otp,
  });
  await newOtp.save();
  return newOtp;
};

// Hàm lấy OTP từ database (nếu cần)
const getOTPByEmail = async (email) => {
  return await OtpModel.findOne({ email });
};

// Hàm xóa OTP sau khi xác thực (nếu cần)
const deleteOTP = async (email) => {
  return await OtpModel.deleteMany({ email });
};

const verifyOTP = async (email, inputOtp) => {
  const otpRecord = await OtpModel.find({ email });

  if (!otpRecord) {
    throw new BadRequestError('expired OTP');
  }
  const lastOTP = otpRecord[otpRecord.length - 1];
  if (lastOTP.otp !== inputOtp) {
    throw new InvalidError('Invalid OTP');
  }

  return true;
};


const sendEmailLinkVerify = async ({ html, toEmail, subject, replacements }) => {
  try {
    // Compile HTML template với Handlebars
    const compiledTemplate = handlebars.compile(html);
    const htmlToSend = compiledTemplate(replacements);

    const mailOptions = {
      from: '"ShopDev" <nqtrung0810@gmail.com>',
      to: toEmail,
      subject,
      html: htmlToSend,
    };

    // Sử dụng async/await thay cho callback
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);

  } catch (err) {
    console.error('Error while sending email: ', err);
    throw new Error('Failed to send email');
  }
};

const sendOTPEmail = async (email, templateName) => {
  try {
    const token = await newOTP(email);
    console.log('Generated OTP:', token.otp);

    const template = await getTemplate({ tem_name: templateName });

    // Gọi hàm gửi email và chờ nó hoàn thành
    await sendEmailLinkVerify({
      html: template.tem_html,
      toEmail: email,
      subject: template.tem_subject,
      replacements: {
        otp: token.otp, // Thay thế bằng dữ liệu thực tế từ model OTP.
        name: token.email, // Thay thế bằng dữ liệu thực tế từ model OTP.
        // link: `http://localhost:3000/verify-email/${token._id}`, // Thay thế bằng link xác minh thực tế.
        expires: '5 minutes', // Thay thế bằng thời gian hết hạn thực tế.
      },
    });

    return token;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Dịch vụ gửi email với đường dẫn thiết lập lại mật khẩu
const sendResetPasswordEmail = async (email, resetPasswordLink) => {
  const template = await getTemplate({ tem_name: 'forgot-password' }); // Lấy template cho email thiết lập lại mật khẩu

  await sendEmailLinkVerify({
    html: template.tem_html,
    toEmail: email,
    subject: template.tem_subject,
    replacements: {
      resetLink: resetPasswordLink, // Đường dẫn thiết lập lại mật khẩu
      name: email, // Tên người dùng (hoặc có thể là tên thực tế nếu có)
      expires: '15 minutes', // Thời gian hết hạn cho token
    },
  });

};




module.exports = {
  newOTP,
  getOTPByEmail,
  deleteOTP,
  verifyOTP,
  sendOTPEmail,
  generateOTP,
  sendResetPasswordEmail,
};
