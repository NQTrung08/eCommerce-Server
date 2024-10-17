const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CategoryController = require('../../controllers/category.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const router = express.Router();

router.get('/', asyncHandler(CategoryController.getAllCategories));
router.get('/buildTree', asyncHandler(CategoryController.buildCategoryTree))

router.post('/', authenticate, authorize(['admin']), asyncHandler(CategoryController.addCategory));
router.post('/search', asyncHandler(CategoryController.searchCategory));
router.get('/root', asyncHandler(CategoryController.getCategoryRoot));

router.get('/:id', asyncHandler(CategoryController.getCategoryById));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(CategoryController.updateCategory));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(CategoryController.deleteCategory));

router.get('/:id/children', asyncHandler(CategoryController.getCategoryWithChildren));

module.exports = router
