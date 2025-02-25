
'use strict';
const express = require('express');
const reviewController = require('../../controllers/review.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware');
const router = express.Router();


router.get('/', authenticate, authorize(['admin']), asyncHandler(reviewController.getAll))
router.post('/count', asyncHandler(reviewController.getCountReview))
router.get('/shop-owners', authenticate, authorize(['shop']), asyncHandler(reviewController.getAllReviewsForShop))
router.get('/shop/:shopId', authenticate, asyncHandler(reviewController.getAllReviewsForShopId))
// Create a new review
router.post('/', authenticate, asyncHandler(reviewController.createReview));

// Get all reviews by a product
router.get('/:productId', asyncHandler(reviewController.getReviewsByProductId));


module.exports = router;