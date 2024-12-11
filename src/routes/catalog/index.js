const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CatalogShopController = require('../../controllers/catalogShop.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

// create catalog shop
router.post('/', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.newCatalogShop));
// thống kê doanh thu theo catalog for shop
router.get('/shop-owner', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.getCatalogShopOwner));
router.get('/shop/statistical', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.getStatisticalCatalogByShopId));
// get catalog shop
router.get('/shop/:shopId', asyncHandler(CatalogShopController.getCatalogShop));


// update catalog
router.put('/:catalogId', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.updateCatalogShop));

// delete catalog
router.delete('/:catalogId', authenticate, authorize(['shop']), asyncHandler(CatalogShopController.deleteCatalogShop));
module.exports = router;