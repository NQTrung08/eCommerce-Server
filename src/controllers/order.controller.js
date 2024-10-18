// order.controller.js
'use strict';
const { createOrder, getOrdersByUserId } = require('../services/order.service');
const { createVnpayPaymentUrl } = require('../services/payment.service');
const { SuccessResponse, SuccessReponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { createVnpayTransaction } = require('../services/transaction.service');

class OrderController {
  // Hàm xử lý yêu cầu tạo đơn hàng
  createOrder = async (req, res, next) => {
    const { _id } = req.user; // Lấy id người dùng từ req.user
    const { orders, paymentMethod, shippingAddress, paymentGateway } = req.body; // Nhận luôn paymentGateway từ req.body
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    // Tạo đơn hàng
    const newOrders = await createOrder({
      userId: _id,
      orders,
      paymentMethod,
      shippingAddress,
      paymentGateway
    });

    console.log('new orderrr', newOrders)
    const orderIds = newOrders.orders.map(order => order._id); // Hoặc thuộc tính nào đó chứa ID


    // Xử lý thanh toán online (nếu có)
    if (paymentMethod === 'online') {
      let paymentUrl;
      if (paymentGateway === 'VNPAY') {
        paymentUrl = await createVnpayPaymentUrl({ orderIds, totalAmount: newOrders.totalAmountOrders, ipAddr });
      } else if (paymentGateway === 'Momo') {
        // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
        paymentUrl = await createMomoPaymentUrl(newOrders.totalAmountOrders, ipAddr);
      } else {
        throw new BadRequestError('Unsupported payment gateway');
      }

      // Chuyển hướng đến URL thanh toán
      return res.redirect(paymentUrl);
    };
    // Trả về phản hồi thành công
    new SuccessReponse({
      message: 'Order created successfully',
      data: newOrders,
    }).send(res);

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

  // get order by user id filter by status
  getOrdersByUserId = async (req, res, next) => {
    const { _id } = req.user;
    const { status } = req.query;
    const orders = await getOrdersByUserId({ userId: _id, status });
    new SuccessReponse({
      message: 'Get orders successfully',
      data: orders
    }).send(res);
  }

  // update status order
  updateStatusOrder = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await this.updateStatusOrder({ orderId: id, status });
    new SuccessReponse({
      message: 'Update status order successfully',
      data: order
    }).send(res);
  }

}
module.exports = new OrderController();
