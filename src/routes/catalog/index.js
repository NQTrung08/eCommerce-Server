const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CatalogShopController = require('../../controllers/catalogShop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

// create catalog shop
router.post('/', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.newCatalogShop));
// get catalog shop
router.get('/:shopId', asyncHandler(CatalogShopController.getCatalogShop));
module.exports = router;