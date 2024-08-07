const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const CategoryController = require('../../controllers/category.controller');
const { authenticate, verifyAdmin } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const router = express.Router();

router.get('/', authenticate, asyncHandler(CategoryController.getAllCategories));
router.get('/buildTree', authenticate, asyncHandler(CategoryController.buildCategoryTree))

router.post('/create', authenticate, verifyAdmin, asyncHandler(CategoryController.addCategory));
router.post('/search', authenticate, asyncHandler(CategoryController.searchCategory));
router.get('/root', authenticate, asyncHandler(CategoryController.getCategoryRoot));

router.get('/:id', authenticate, asyncHandler(CategoryController.getCategoryById));
router.put('/:id', authenticate, verifyAdmin, asyncHandler(CategoryController.updateCategory));
router.delete('/:id', authenticate, verifyAdmin, asyncHandler(CategoryController.deleteCategory));

router.get('/:id/children', authenticate, asyncHandler(CategoryController.getCategoryWithChildren));

module.exports = router
