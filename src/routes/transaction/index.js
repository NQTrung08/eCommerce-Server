const express = require('express');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware');
const { asyncHandler } = require('../../helpers/asyncHandler');
const transactionController = require('../../controllers/transaction.controller');

const router = express.Router();

// Đảm bảo rằng userRoutes là một hàm middleware hoặc router
router.get('/', authenticate, authorize(['admin']), asyncHandler(transactionController.getTransactions));
router.get('/shop', authenticate, authorize(['shop', 'admin']), asyncHandler(transactionController.getTransactionsByShopId));

module.exports = router;
