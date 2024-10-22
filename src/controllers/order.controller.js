// order.controller.js
'use strict';
const { createOrder, getOrdersByUserId, cancelOrder, updateOrderStatus } = require('../services/order.service');
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
      } else if (paymentGateway === 'MOMO') {
        // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
        paymentUrl = await createMomoPaymentUrl(newOrders.totalAmountOrders, ipAddr);
      } else {
        throw new BadRequestError('Unsupported payment gateway');
      }

      // Chuyển hướng đến URL thanh toán
      return res.status(200).json({
        message: 'Order created successfully, redirect to payment',
        paymentUrl, // Trả về paymentUrl
        data: newOrders,
      });


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

    // Nếu thanh toán thành công
    const responseCode = vnp_Params['vnp_ResponseCode']; // Lấy response code
    let redirectUrl;
    if (responseCode === '00') {
      // Nếu thành công, chuyển hướng về FE với trạng thái success
      redirectUrl = `http://localhost:3000/payment-success?transactionId=${vnp_Params['vnp_TxnRef']}&status=success`;
    } else {
      // Nếu thất bại, chuyển hướng về FE với trạng thái failed
      redirectUrl = `http://localhost:3000/payment-failed?transactionId=${vnp_Params['vnp_TxnRef']}&status=failed`;
    }

    // Thực hiện chuyển hướng về frontend với kết quả
    return res.redirect(redirectUrl);
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
    const order = await updateStatusOrder({ orderId: id, status });
    new SuccessReponse({
      message: 'Update status order successfully',
      data: order
    }).send(res);
  }
  // cancel order if order status is pending
  cancelOrder = async (req, res, next) => {
    const order = await cancelOrder({
      userId: req.user._id,
      orderId: req.params.orderId,
    });
    new SuccessReponse({
      message: 'Cancel order successfully',
      data: order
    }).send(res);
  }

}
module.exports = new OrderController();
