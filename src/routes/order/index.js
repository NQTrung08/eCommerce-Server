const express = require('express');
const orderController = require('../../controllers/order.controller');
const { authenticate } = require('../../middewares/authenticate.middleware');
const  {asyncHandler} = require('../../helpers/asyncHandler');
const router = express.Router();
// Endpoint nhận thông tin thanh toán từ VNPAY
router.post('/', authenticate, asyncHandler(orderController.createOrder));
router.get('/vnpay_return', asyncHandler(orderController.vnpayReturn));

router.get('/user', authenticate, asyncHandler(orderController.getOrdersByUserId));

// update trạng thái đơn hàng
router.put('/:id', authenticate, authorize(['shop']), asyncHandler(orderController.updateOrderStatus));

// cancel đơn hàng
router.put('/cancel/:orderId', authenticate, asyncHandler(orderController.cancelOrder));
module.exports = router;
