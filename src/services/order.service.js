const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");


/**
 * 
 *  orders [
 *     { shopId, 
 *       products: [
 *                     {
 * 
 *                      }
 *                    ],
 *        total_price
 *       }
 *  ]
 */

const createOrder = async ({ userId, orders, paymentMethod, shippingAddress, paymentGateway }) => {

  if (!userId) {
    throw new BadRequestError('User id is required');
  }
  // if (!products || products.length === 0) {
  //   throw new BadRequestError('Products are required');
  // }
  // if (!totalValue || totalValue <= 0) {
  //   throw new BadRequestError('Total value must be greater than zero');
  // }
  // if (!shippingAddress) {
  //   throw new BadRequestError('Shipping address is required');
  // }

  if (!orders || orders.length === 0) {
    throw new BadRequestError('Không có đơn hàng để xử lý');
  }

  let createdOrders = [];
  let totalAmountOrders = 0;
  for (const orderData of orders) {
    // Tạo đơn hàng mới
    const newOrder = new orderModel({
      order_userId: userId,
      order_trackingNumber: `t3g${Date.now()}`, // Tạo số tracking mới
      order_shopId: orderData.shopId,
      order_products: orderData.products,
      order_total_price: orderData.totalPrice,
      order_payment_method: paymentMethod,
      order_shipping_address: shippingAddress,
      order_payment_gateway: paymentMethod === 'online' ? paymentGateway : 'none', // Lưu thông tin cổng thanh toán
      order_status: 'pending', // Trạng thái đơn hàng mặc định là đang chờ xử lý
    });
    await newOrder.save(); // Lưu đơn hàng vào DB
    createdOrders.push(newOrder);
    // Cộng dồn tổng tiền
    totalAmountOrders += orderData.totalPrice; 
  }

  return {
    orders: createdOrders, // Mảng các đơn hàng đã tạo
    totalAmountOrders, // Tổng tiền của các đơn hàng
  };
};




module.exports = {
  createOrder,
};
