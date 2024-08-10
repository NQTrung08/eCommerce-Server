const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ShopController = require('../../controllers/shop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const router = express.Router();


router.get('/', authenticate, authorize(['admin']), asyncHandler(ShopController.getAllShops));
// router.get('/shops/:id', authenticate, asyncHandler(ShopController.getShopById));
router.post('/create',authenticate, authorize(['admin', 'shop']), asyncHandler(ShopController.newShop));

module.exports = router;