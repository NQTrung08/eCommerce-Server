const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");

/**
 * 
 *  orders [
 *     { shopId, 
 *       products: [
 *                     {
 *                      productId,
 *                      quantity
 *                     }
 *                    ],
 *        total_price
 *       }
 *  ]
 */

const createOrder = async ({ userId, orders, paymentMethod, shippingAddress, paymentGateway }) => {

  if (!userId) {
    throw new BadRequestError('User id is required');
  }

  if (!orders || orders.length === 0) {
    throw new BadRequestError('Không có đơn hàng để xử lý');
  }

  let createdOrders = [];
  let totalAmountOrders = 0;

  // Kiểm tra số lượng sản phẩm trước khi tạo đơn hàng
  for (const orderData of orders) {
    for (const product of orderData.products) {
      const existingProduct = await productModel.findById(product.productId);
      if (!existingProduct) {
        throw new BadRequestError(`Sản phẩm với ID ${product.productId} không tồn tại`);
      }

      // Kiểm tra số lượng sản phẩm có đủ không
      if (existingProduct.product_quantity < product.quantity) {
        throw new BadRequestError(`Không đủ số lượng sản phẩm ${existingProduct.product_name}`);
      }
    }
  }

  // Nếu kiểm tra số lượng sản phẩm thành công, tiến hành tạo đơn hàng
  for (const orderData of orders) {
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

    // Giảm số lượng sản phẩm sau khi đặt hàng
    for (const product of orderData.products) {
      const existingProduct = await productModel.findById(product.productId);

      // Giảm số lượng sản phẩm
      existingProduct.product_quantity -= product.quantity;
      await existingProduct.save(); // Lưu thay đổi vào DB
    }
  }

  return {
    orders: createdOrders, // Mảng các đơn hàng đã tạo
    totalAmountOrders, // Tổng tiền của các đơn hàng
  };
};

module.exports = {
  createOrder,
};
