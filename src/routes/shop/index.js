const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ShopController = require('../../controllers/shop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();


router.get('/', authenticate, authorize(['admin']), asyncHandler(ShopController.getAllShops));
// router.get('/shops/:id', authenticate, asyncHandler(ShopController.getShopById));
router.post('/create',authenticate, authorize(['admin', 'shop']), uploadStorage.single('file'),  asyncHandler(ShopController.newShop));

router.post('update/logo', authenticate, authorize(['shop']), asyncHandler(ShopController.updateShopLogo));

module.exports = router;