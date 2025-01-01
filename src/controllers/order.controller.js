// order.controller.js
'use strict';
const { createOrder, getOrdersByUserId, cancelOrder, updateOrderStatus, removePurchasedItemsFromCart, getAllOrders, getOrdersForShop, paymentReturn, updatePaymentMethod, getDetailOrder } = require('../services/order.service');
const { createVnpayPaymentUrl, createMoMoPaymentUrl, updateStatusOrders } = require('../services/payment.service');
const { SuccessReponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { createVnpayTransaction, createMoMoTransaction, verifySignature } = require('../services/transaction.service');
const { app: { redirectUrl } } = require('../configs/config.app');
const { momoConfig } = require('../configs/payment.config')
const shopModel = require('../models/shop.model');
const crypto = require('crypto');
const orderModel = require('../models/order.model');
class OrderController {

  getAll = async (req, res, next) => {
    new SuccessReponse({
      message: 'Get all orders',
      data: await getAllOrders({ status: req.query.status })
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
    try {
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
      if (!!newOrders) {
        // Loại bỏ các sản phẩm đã mua khỏi giỏ hàng của người dùng
        await removePurchasedItemsFromCart(_id, orders);
      }
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

      // Trả về phản hồi thành công
      new SuccessReponse({
        message: 'Order created successfully',
        data: newOrders,
      }).send(res);

    } catch (e) {
      console.log(e)
      throw new BadRequestError('product_thumb is required')
    }

  }

  // Hàm nhận thông tin thanh toán thành công từ VNPAY
  vnpayReturn = async (req, res, next) => {
    const vnp_Params = req.query;
    // Kiểm tra tính hợp lệ của secure hash và lưu giao dịch
    const transaction = await createVnpayTransaction({
      params: vnp_Params,
    });

    console.log('Transaction', transaction)

    // Nếu thanh toán thành công
    const responseCode = vnp_Params['vnp_ResponseCode']; // Lấy response code
    let redirectUrlPayment;
    if (responseCode === '00') {
      await updateStatusOrders(vnp_Params['vnp_TxnRef'], 'confirmed')
      // Nếu thành công, chuyển hướng về FE với trạng thái success
      redirectUrlPayment = `${redirectUrl}/payment-success?transactionId=${transaction[0].transactionNo}&status=success`;
    } else {
      await updateStatusOrders(vnp_Params['vnp_TxnRef'], 'waiting')
      // Nếu thất bại, chuyển hướng về FE với trạng thái failed
      redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${transaction[0].transactionNo}&status=failed`;
    }
    console.log("rés", responseCode)
    // Thực hiện chuyển hướng về frontend với kết quả
    return res.redirect(redirectUrlPayment);
  };


  // nhận thông tin từ momo
  momoReturn = async (req, res, next) => {
    const momo_params = req.query;
    console.log("momoReturn", momo_params)
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
        transactionStatus: momo_params.resultCode,
      });

      if (momo_params.resultCode == '0') {
        await updateStatusOrders(momo_params.orderId, 'confirmed')
        // Redirect tới trang thanh toán thành công
        redirectUrlPayment = `${redirectUrl}/payment-success?transactionId=${transactionResult[0].transactionNo}&status=success`;
      } else {
        // update thành chờ thanh toán
        await updateStatusOrders(momo_params.orderId, 'waiting')
        redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${transactionResult[0].transactionNo}&status=failed`;
      }
    } else {
      redirectUrlPayment = `${redirectUrl}/payment-failed?transactionId=${transactionResult[0].transactionNo}&status=failed`;
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

  // update kiểu thanh toán
  updatePaymentMethod = async (req, res, next) => {
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    const { orderIds, paymentMethod, paymentGateway } = req.body;
    const order = await updatePaymentMethod({ orderIds, paymentMethod, paymentGateway, ipAddr });
    new SuccessReponse({
      message: 'Update payment method successfully',
      data: order
    }).send(res);
  }

  // paymentReturn
  paymentReturn = async (req, res, next) => {
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    const { orderIds, totalAmountOrders, paymentMethod, paymentGateway } = req.body;
    const order = await paymentReturn({ orderIds, totalAmountOrders, paymentMethod, paymentGateway });
    new SuccessReponse({
      message: 'Payment return successfully',
      data: order
    }).send(res);
  }

  getDetailOrder = async (req, res) => {
    const order = await getDetailOrder({ orderId: req.params.orderId });
    new SuccessReponse({
      message: 'Get order detail successfully',
      data: order
    }).send(res);
  }
}
module.exports = new OrderController();
