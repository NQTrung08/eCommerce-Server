require('dotenv').config();
const { vnpay: {vnp_ReturnUrl}, momo: {
  momo_ReturnUrl
}} = require('./config.app');

const vnpayConfig = {
  vnp_TmnCode: "GSO664Y1",
  vnp_HashSecret: "YSIBZM6K3QPWR2GXB5UF6QPSBT5BQRP5",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: vnp_ReturnUrl,
}

const momoConfig = {
  momo_ReturnUrl: momo_ReturnUrl
}

module.exports = {
  vnpayConfig,
  momoConfig
};
