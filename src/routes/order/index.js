const express = require('express');
const orderController = require('../../controllers/order.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware');
const  {asyncHandler} = require('../../helpers/asyncHandler');
const router = express.Router();

// Endpoint nhận thông tin thanh toán từ VNPAY
router.get('/', authenticate, authorize(['admin']), asyncHandler(orderController.getAll))
router.get('/shop-owners', authenticate, authorize(['shop']), asyncHandler(orderController.getOrdersForShop))
router.post('/', authenticate, asyncHandler(orderController.createOrder));
router.get('/vnpay_return', asyncHandler(orderController.vnpayReturn));
router.get('/momo_return', asyncHandler(orderController.momoReturn));

router.get('/user', authenticate, asyncHandler(orderController.getOrdersByUserId));

// update trạng thái đơn hàng
router.post('/payment-method', authenticate, asyncHandler(orderController.updatePaymentMethod));
router.post('/payment-return', authenticate, asyncHandler(orderController.paymentReturn));
router.put('/:id', authenticate, authorize(['shop']), asyncHandler(orderController.updateStatusOrder));
router.get('/:orderId', authenticate, asyncHandler(orderController.getDetailOrder))

// cancel đơn hàng
router.put('/cancel/:orderId', authenticate, asyncHandler(orderController.cancelOrder));
module.exports = router;
