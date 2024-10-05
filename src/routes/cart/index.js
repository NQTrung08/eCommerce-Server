const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CartController = require('../../controllers/cart.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const cartController = require('../../controllers/cart.controller');
const router = express.Router();


router.get('/',authenticate, asyncHandler(cartController.getCart));
router.post('/',authenticate, asyncHandler(cartController.addToCart));
router.delete('/products',authenticate, asyncHandler(cartController.removeProductsFromCart));
router.post('/products/quantity',authenticate, asyncHandler(cartController.updateQuantityFromCart));
router.delete('/:productId',authenticate, asyncHandler(cartController.removeFromCart));


module.exports = router;