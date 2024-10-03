
const vnpayConfig = {
  vnp_TmnCode: "GSO664Y1",
  vnp_HashSecret: "YSIBZM6K3QPWR2GXB5UF6QPSBT5BQRP5",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:8080/v1/api/order/vnpay_return"
}

module.exports = {
  vnpayConfig,
};
