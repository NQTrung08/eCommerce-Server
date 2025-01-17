const { BadRequestError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const { createVnpayPaymentUrl, createMoMoPaymentUrl } = require("./payment.service");

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
      if (existingProduct.product_quantity == 0) {
        existingProduct.product_status = 'outOfStock'; // Cập nhật trạng thái sản phẩm
        existingProduct.product_quantity = 0; // Cập nhật số lượng sản phẩm về 0 khi hết hàng
      }
      await existingProduct.save(); // Lưu thay đổi vào DB

    }
  }



  return {
    orders: createdOrders, // Mảng các đơn hàng đã tạo
    totalAmountOrders, // Tổng tiền của các đơn hàng
  };
};

const getAllOrders = async ({ status }) => {
  let orders;
  if (!status) {
    orders = await orderModel.find()
      .populate('order_shopId')
      .populate('order_products.productId')
      .populate('order_userId')
  }
  else {
    orders = await orderModel.find({
      order_status: status
    })
     .populate('order_shopId')
     .populate('order_products.productId')
     .populate('order_userId')
  }
  return orders;
}

const getOrdersForShop = async ({ shopId, status }) => {
  let orders;
  if (!status) {
    orders = await orderModel.find({
      order_shopId: shopId
    })
      .populate('order_shopId')
      .populate('order_products.productId')
      .populate('order_userId')
  } else {
    orders = await orderModel.find({
      order_shopId: shopId,
      order_status: status
    })
      .populate('order_shopId')
      .populate('order_products.productId')
      .populate('order_userId')
  }

  return orders;
}

// get order by user id filter by status
const getOrdersByUserId = async ({ userId, status }) => {
  const query = { order_userId: userId };

  // Nếu có truyền status, thêm điều kiện lọc theo status
  if (status) {
    query.order_status = status;
  }

  const orders = await orderModel.find(query);
  return orders;
};

// update status order
const updateOrderStatus = async ({ orderId, status }) => {
  const query = { _id: orderId };
  const update = { order_status: status };
  const options = { new: true };
  const updatedOrder = await orderModel.findOneAndUpdate(query, update, options);
  return updatedOrder;
}

// cancel order if order status is pending
const cancelOrder = async ({ userId, orderId }) => {
  const query = { _id: orderId };
  const order = await orderModel.findById(orderId);

  if (!order) {
    throw new BadRequestError('Order not found');
  }

  // check order is belong to user
  if (order.order_userId.toString() !== userId) {
    throw new BadRequestError('Order is not belong to user');
  }

  // Kiểm tra nếu trạng thái đơn hàng là 'pending'
  if (order.order_status === 'pending' || order.order_status === 'waiting') {
    const update = { order_status: 'canceled' };
    const options = { new: true };

    // Cập nhật trạng thái đơn hàng thành 'cancelled'
    const updatedOrder = await orderModel.findOneAndUpdate(query, update, options);
    return updatedOrder;
  } else {
    // Nếu trạng thái không phải 'pending', trả về lỗi
    throw new BadRequestError(`Order cannot be canceled because its status is ${order.order_status}`);
  }
};


const removePurchasedItemsFromCart = async (userId, orders) => {
  const cart = await cartModel.findOne({ cart_userId: userId });
  if (!cart) return;

  // Duyệt qua từng sản phẩm trong đơn hàng và loại bỏ khỏi giỏ hàng
  orders.forEach(order => {
    order.products.forEach(purchasedProduct => {
      cart.cart_products = cart.cart_products.filter(cartProduct => {
        return cartProduct.productId.toString() !== purchasedProduct.productId.toString();
      });
    });
  });

  await cart.save(); // Lưu lại giỏ hàng sau khi cập nhật
}

const updatePaymentMethod = async ({
  orderIds,
  totalAmountOrders,
  paymentMethod,
  paymentGateway,
  ipAddr
}) => {

  if (paymentMethod === 'online') {
    let paymentUrl;
    if (paymentGateway === 'VNPAY') {
      paymentUrl = await createVnpayPaymentUrl({ orderIds, totalAmount: totalAmountOrders, ipAddr });
    } else if (paymentGateway === 'MOMO') {
      // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
      paymentUrl = await createMoMoPaymentUrl({ orderIds, amount: totalAmountOrders, ipAddr });
    } else {
      throw new BadRequestError('Unsupported payment gateway');
    }

    // Chuyển hướng đến URL thanh toán
    return paymentUrl
  }
  const orders = await orderModel.updateMany(
    { _id: { $in: orderIds } },
    {
      order_payment_method: paymentMethod,
      order_payment_gateway: paymentGateway || "none",
      order_status: 'pending',
    }
  );
  return orders // Trả về mảng đơn hàng đã cập nhật
}

const paymentReturn = async ({
  orderIds,
  totalAmountOrders,
  paymentMethod = 'online',
  paymentGateway,
  ipAddr
}) => {
  let paymentUrl;
  if (paymentGateway === 'VNPAY') {
    console.log("2132132")
    paymentUrl = await createVnpayPaymentUrl({ orderIds, totalAmount: totalAmountOrders, ipAddr });
  } else if (paymentGateway == 'MOMO') {
    // Giả sử hàm createMomoPaymentUrl đã được định nghĩa
    paymentUrl = await createMoMoPaymentUrl({ orderIds, amount: totalAmountOrders, ipAddr });
  } else {
    throw new BadRequestError('Unsupported payment gateway');
  }
  return paymentUrl // Trả về paymentUrl
}

const getDetailOrder = async ({
  orderId
}) => {
  const order = await orderModel.findById(orderId)
    .populate('order_shopId')
    .populate('order_userId')
    .populate('order_products.productId');
  return order;
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  cancelOrder,
  removePurchasedItemsFromCart,
  getOrdersForShop,
  updatePaymentMethod,
  paymentReturn,
  getDetailOrder
};
