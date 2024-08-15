const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ShopController = require('../../controllers/shop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();


router.post('/create',authenticate, authorize(['admin', 'shop']), uploadStorage.single('file'),  asyncHandler(ShopController.newShop));

// get in4 cho chỉ shop đó mới được xem thông tin (sau này có 1 số thông tin nhạy cảm như số dư, mã thuế,...)
router.get('/view-own', authenticate, authorize(['shop']), asyncHandler(ShopController.getShopByOwnerId));

// get id cho tất cả các user view
router.get('/:id', authenticate, asyncHandler(ShopController.getShopById));
// get all shop chỉ cho admin
router.get('/', authenticate, authorize(['admin']), asyncHandler(ShopController.getAllShops));

router.post('update/logo', authenticate, authorize(['shop']), asyncHandler(ShopController.updateShopLogo));

module.exports = router;