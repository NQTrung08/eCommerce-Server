const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng của email
  },
});


module.exports = transporter;