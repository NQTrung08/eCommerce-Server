// order.controller.js
'use strict';
const { createOrder } = require('../services/order.service');
const { createVnpayPaymentUrl } = require('../services/payment.service');
const { SuccessResponse, SuccessReponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { createVnpayTransaction } = require('../services/transaction.service');

class OrderController {
  // Hàm xử lý yêu cầu tạo đơn hàng
  createOrder = async (req, res, next) => {
    const { _id } = req.user; // Lấy id người dùng từ req.user
    console.log("idđ", _id);
    const { products, totalValue, paymentMethod, shippingAddress, paymentGateway } = req.body; // Nhận luôn paymentGateway từ req.body
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    // Tạo đơn hàng
    const newOrder = await createOrder({
      userId: _id,
      products,
      totalValue,
      paymentMethod,
      shippingAddress,
      paymentGateway
    });

    console.log('new orderrr', newOrder)

    // Xử lý thanh toán online (nếu có)
    if (paymentMethod === 'online') {
      let paymentUrl;
      if (paymentGateway === 'VNPAY') {
        paymentUrl = await createVnpayPaymentUrl(newOrder, ipAddr);
      } else if (paymentGateway === 'Momo') {
        // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
        paymentUrl = await createMomoPaymentUrl(newOrder, ipAddr);
      } else {
        throw new BadRequestError('Unsupported payment gateway');
      }

      // return res.redirect(paymentUrl); // Chuyển hướng đến URL thanh toán

      // Trả về phản hồi thành công cho đơn hàng COD
      return res.status(200).json({
        message: 'Order created successfully',
        redirect: paymentUrl, // Trả về URL thanh toán
        data: newOrder,
      });
    };
  }

  // Hàm nhận thông tin thanh toán thành công từ VNPAY
  vnpayReturn = async (req, res, next) => {
    const vnp_Params = req.query;

    // Kiểm tra tính hợp lệ của secure hash và lưu giao dịch
    const transaction = await createVnpayTransaction({
      params: vnp_Params,
    });

    // Trả về phản hồi thành công
    new SuccessReponse({
      message: 'Payment processed successfully',
      data: transaction
    }).send(res);
  };


}
module.exports = new OrderController();
