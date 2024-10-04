const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ProductController = require('../../controllers/product.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

router.post('/create',authenticate, authorize(['shop']), uploadStorage.array('files', 10), asyncHandler(ProductController.newProduct));

router.get('/:id', authenticate, asyncHandler(ProductController.getProductById))
router.post('/',authenticate, asyncHandler(ProductController.searchProducts));
router.get('/', asyncHandler(ProductController.getAllProducts));

module.exports = router
