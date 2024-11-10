const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CategoryController = require('../../controllers/category.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

router.get('/', asyncHandler(CategoryController.getAllCategories));
router.get('/buildTree', asyncHandler(CategoryController.buildCategoryTree))

router.post('/', authenticate, authorize(['admin']), uploadStorage.single('file'), asyncHandler(CategoryController.addCategory));
router.post('/search', asyncHandler(CategoryController.searchCategory));
router.get('/root', asyncHandler(CategoryController.getCategoryRoot));

// thống kế doanh thu category cho shop
router.get('/statistical/shop', authenticate, authorize(['shop']), asyncHandler(CategoryController.getStatisticalCategoryByShop));

// thống kế  doanh thu category cho admin
router.get('/statistical', authenticate, authorize(['admin']), asyncHandler(CategoryController.getStatisticalCategories));
// update parent for [ids]
router.put('/move-node', authenticate, authorize(['admin']), asyncHandler(CategoryController.moveNode));


router.get('/:id', asyncHandler(CategoryController.getCategoryById));
router.put('/:id', authenticate, authorize(['admin']), uploadStorage.single('file'), asyncHandler(CategoryController.updateCategory));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(CategoryController.deleteCategory));

router.get('/:id/children', asyncHandler(CategoryController.getCategoryWithChildren));


router.get('/:id/statistical', authenticate, authorize(['admin']), asyncHandler(CategoryController.getStatisticalCategory));

// update parent for [ids]

module.exports = router
