// order.controller.js
'use strict';
const { createOrder, getOrdersByUserId, cancelOrder, updateOrderStatus, removePurchasedItemsFromCart, getAllOrders, getOrdersForShop } = require('../services/order.service');
const { createVnpayPaymentUrl, createMoMoPaymentUrl, updateStatusOrders } = require('../services/payment.service');
const { SuccessReponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { createVnpayTransaction, createMoMoTransaction, verifySignature } = require('../services/transaction.service');
const { app: { redirectUrl } } = require('../configs/config.app');
const { momoConfig } = require('../configs/payment.config')
const shopModel = require('../models/shop.model');
const crypto = require('crypto');
class OrderController {

  getAll = async (req, res, next) => {
    new SuccessReponse({
      message: 'Get all orders',
      data: await getAllOrders()
    }).send(res)
  }

  getOrdersForShop = async (req, res, next) => {
    const id = req.user._id
    const { status } = req.query;
    const shop = await shopModel.findOne({
      owner_id: id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    new SuccessReponse({
      message: 'All orders for shop',
      data: await getOrdersForShop({
        shopId: shop._id,
        status: status
      })
    }).send(res)
  }


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
    const orderIds = newOrders.orders.map(order => order._id); // Hoặc thuộc tính nào đó chứa ID


    // Xử lý thanh toán online (nếu có)
    if (paymentMethod === 'online') {
      let paymentUrl;
      if (paymentGateway === 'VNPAY') {
        paymentUrl = await createVnpayPaymentUrl({ orderIds, totalAmount: newOrders.totalAmountOrders, ipAddr });
      } else if (paymentGateway === 'MOMO') {
        // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
        paymentUrl = await createMoMoPaymentUrl({ orderIds, amount: newOrders.totalAmountOrders, ipAddr });
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

    // Loại bỏ các sản phẩm đã mua khỏi giỏ hàng của người dùng
    await removePurchasedItemsFromCart(_id, orders);

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
    let redirectUrlPayment;
    if (responseCode === '00') {
      // Nếu thành công, chuyển hướng về FE với trạng thái success
      redirectUrlPayment = `${redirectUrl}/payment-success?transactionId=${vnp_Params['vnp_TxnRef']}&status=success`;
    } else {
      // Nếu thất bại, chuyển hướng về FE với trạng thái failed
      redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${vnp_Params['vnp_TxnRef']}&status=failed`;
    }

    // Thực hiện chuyển hướng về frontend với kết quả
    return res.redirect(redirectUrlPayment);
  };


  // nhận thông tin từ momo
  momoReturn = async (req, res, next) => {
    const momo_params = req.query;

    const verify = await verifySignature(momo_params)

    if (!verify) return null;
    let redirectUrlPayment;
    if (momo_params.resultCode == '0') {
      // Lưu thông tin giao dịch vào cơ sở dữ liệu
      const transactionResult = await createMoMoTransaction({
        transactionId: momo_params.transId,
        orderId: momo_params.orderId,
        amount: momo_params.amount,
        responseCode: momo_params.resultCode,
        transactionStatus: 'SUCCESS',
      });

      if (transactionResult.status === 200) {
        await updateStatusOrders(momo_params.orderId, 'waiting')
        // Redirect tới trang thanh toán thành công
        redirectUrlPayment = `${redirectUrl}/payment-success?transactionId=${momo_params.transId}&status=success`;
      } else {
        redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${momo_params.transId}&status=failed`;
      }
    } else {
      redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${momo_params.transId}&status=failed`;
    }
    return res.redirect(redirectUrlPayment);
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
    const { status } = req.query;
    console.log("orderId - status", id, status);
    const order = await updateOrderStatus({ orderId: id, status });
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
