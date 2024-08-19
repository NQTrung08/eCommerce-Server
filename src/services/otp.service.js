// services/otp.service.js
const OtpModel = require('../models/otp.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { BadRequestError, InvalidError } = require('../core/error.response');
const { getTemplate } = require('./template.service');
const transporter  = require('../dbs/init.nodemailer');


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


const sendEmailLinkVerify = async ({
  html,
  toEmail,
  subject,
  replacements
}) => {
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

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email: ', err);
        throw new Error('Failed to send email');
      }
      console.log('Email sent: ', info.messageId);
    });
  } catch (e) {
    console.error('Error while sending email: ', e);
    throw new Error('Failed to send email');
  }
}

const sendOTPEmail = async (email) => {
  try {
    const token = await newOTP(email)
    console.log('Generated OTP:', token.otp);

    const template = await getTemplate({
      tem_name: 'register',
    })

    sendEmailLinkVerify({
      html: template.tem_html,
      toEmail: email,
      subject: template.tem_subject,
      replacements: {
        otp: token.otp, // Replace this with the actual data from the OTP model.
        name: token.email, // Replace this with the actual data from the OTP model.
        // link: `http://localhost:3000/verify-email/${token._id}`, // Replace this with the actual link to the verification endpoint.
        // expires: '5 minutes', // Replace this with the actual expiration time.
      }, // Add any additional data you need to replace in the template here.
    }).catch

    return token
  } catch (error) {
    console.log('Error sending OTP email:', error);
  }
};


module.exports = {
  newOTP,
  getOTPByEmail,
  deleteOTP,
  verifyOTP,
  sendOTPEmail,
  generateOTP,
};
