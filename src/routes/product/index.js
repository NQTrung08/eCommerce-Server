const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ProductController = require('../../controllers/product.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

router.post('/',authenticate, authorize(['shop']), uploadStorage.array('files', 10), asyncHandler(ProductController.newProduct));

router.post('/search',authenticate, asyncHandler(ProductController.searchProducts));
router.get('/', asyncHandler(ProductController.getAllProducts));
router.get('/:id', authenticate, asyncHandler(ProductController.getProductById))
router.put('/:id', authenticate, authorize(['shop']), uploadStorage.array('files', 10), asyncHandler(ProductController.updateProduct));

// Xóa sản phẩm (chỉ chuyển sang trạng thái xóa, không xóa vĩnh viễn)
router.delete('/', authenticate, authorize(['shop']), asyncHandler(ProductController.deleteProducts));

// Đưa sản phẩm về trạng thái công khai
router.post('/public', authenticate, authorize(['shop']), asyncHandler(ProductController.publicProducts));

// Đưa sản phẩm về trạng thái riêng tư
router.post('/draft', authenticate, authorize(['shop']), asyncHandler(ProductController.privateProducts));

module.exports = router
