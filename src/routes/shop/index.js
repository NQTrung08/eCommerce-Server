const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ShopController = require('../../controllers/shop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();


router.post('/create',authenticate, uploadStorage.single('file'),  asyncHandler(ShopController.newShop));

// get in4 cho chỉ shop đó mới được xem thông tin (sau này có 1 số thông tin nhạy cảm như số dư, mã thuế,...)
router.get('/view-own', authenticate, authorize(['shop']), asyncHandler(ShopController.getShopByOwnerId));

// get all shop chỉ cho admin
router.get('/', authenticate, authorize(['admin']), asyncHandler(ShopController.getAllShops));
router.get('/admin/:shopId', authenticate, authorize(['admin']), asyncHandler(ShopController.getShopForAdmin));

// api get bieu đồ
router.get('/admin-revenue', authenticate, authorize(['admin']), asyncHandler(ShopController.getPlatformRevenue));
router.get('/revenue', authenticate, authorize(['shop']), asyncHandler(ShopController.getShopRevenue));
router.get('/revenue/:shopId', authenticate, authorize(['shop']), asyncHandler(ShopController.getShopRevenue));

// get all for user
router.get('/all', asyncHandler(ShopController.getAllShopForUser));
router.post('update/logo', authenticate, authorize(['shop']), asyncHandler(ShopController.updateShopLogo));
// get id cho tất cả các user view
router.get('/:id', asyncHandler(ShopController.getShopById));

module.exports = router;