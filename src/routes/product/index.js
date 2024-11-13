const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ProductController = require('../../controllers/product.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

router.post('/',authenticate, authorize(['shop']), uploadStorage.array('files', 10), asyncHandler(ProductController.newProduct));

router.get('/shop-owners', authenticate, authorize(['shop']), asyncHandler(ProductController.getAllProductsForShop));
router.post('/search', asyncHandler(ProductController.searchProducts));
router.get('/', asyncHandler(ProductController.getAllProducts));
router.get('/:id', asyncHandler(ProductController.getProductById))
router.put('/:id', authenticate, authorize(['shop']), uploadStorage.array('files', 10), asyncHandler(ProductController.updateProduct));

// Xóa sản phẩm (chỉ chuyển sang trạng thái xóa, không xóa vĩnh viễn)
router.delete('/', authenticate, authorize(['shop']), asyncHandler(ProductController.deleteProducts));
// Đưa sản phẩm về trạng thái công khai
router.post('/public', authenticate, authorize(['shop']), asyncHandler(ProductController.publicProducts));

// Đưa sản phẩm về trạng thái riêng tư
router.post('/draft', authenticate, authorize(['shop']), asyncHandler(ProductController.privateProducts));

// get products by shop id and catalog id
router.get('/shop/:shopId/catalog/:catalogId', asyncHandler(ProductController.getProductsByCatalogShop));

// get products by shop id
router.get('/shop/:shopId', asyncHandler(ProductController.getProductsByShopId));

// add products to catalog shop
router.post('/catalog/:catalogId', authenticate, authorize(['shop']), asyncHandler(ProductController.addProductsToCatalogShop));

// filter products by category id
router.get('/category/:categoryId', asyncHandler(ProductController.getProductsByCategoryId));
module.exports = router
