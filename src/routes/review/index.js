

const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')

// Create a new review
router.post('/', authenticate, asyncHandler(reviewController.createReview));

// Get all reviews by a product
router.get('/:productId', asyncHandler(reviewController.getReviewsByProductId));


module.exports = router;