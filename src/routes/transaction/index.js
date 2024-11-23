const express = require('express');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware');
const { asyncHandler } = require('../../helpers/asyncHandler');
const transactionController = require('../../controllers/transaction.controller');

const router = express.Router();

// Đảm bảo rằng userRoutes là một hàm middleware hoặc router
router.get('/', authenticate, authorize(['shop', 'admin']), asyncHandler(transactionController.getTransactions));

module.exports = router;
