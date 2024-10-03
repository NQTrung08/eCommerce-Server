const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");


const createOrder = async ({ userId, products, totalValue, paymentMethod, shippingAddress, paymentGateway }) => {
  if (!userId) {
    throw new BadRequestError('User id is required');
  }
  if (!products || products.length === 0) {
    throw new BadRequestError('Products are required');
  }
  if (!totalValue || totalValue <= 0) {
    throw new BadRequestError('Total value must be greater than zero');
  }
  if (!shippingAddress) {
    throw new BadRequestError('Shipping address is required');
  }

  // Tạo mảng sản phẩm từ req.body
  const orderProducts = products.map(product => ({
    productId: product.productId, // ID sản phẩm
    shopId: product.shopId, // ID shop (nếu có)
    quantity: product.quantity, // Số lượng
    price: product.price, // Giá sản phẩm
    product_name: product.product_name, // Tên sản phẩm
    product_thumb: product.product_thumb // Ảnh sản phẩm
}));

  // Tạo đơn hàng mới
  const newOrder = await orderModel.create({
    order_userId: userId,
    order_trackingNumber: `t3g${Date.now()}`, // Tạo số tracking mới
    order_products: orderProducts,
    order_total_price: totalValue,
    order_payment_method: paymentMethod,
    order_shipping_address: shippingAddress,
    order_payment_gateway: paymentMethod === 'online' ? paymentGateway: 'none', // Lưu thông tin cổng thanh toán
    order_status: 'pending', // Trạng thái đơn hàng mặc đ��nh là đang ch�� xử lý
  });

  return newOrder;
};



module.exports = {
  createOrder,
};
