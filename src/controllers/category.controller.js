'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessReponse, CREATED } = require('../core/success.response');
const shopModel = require('../models/shop.model');
const CategoryService = require('../services/category.service');

class CategoryController {
  addCategory = async(req, res, next) => {
    const file = req.file
    const { category_name, parent_id } = req.body
    if (!file) {
      throw new BadRequestError('Please upload a file')
    }
    console.log('category', category_name)
    return new CREATED({
      message: 'Category created successfully',
      data: await CategoryService.newCategory({
        category_name,
        parent_id,
        file
      })
    }).send(res)
  }

  getAllCategories = async(req, res, next) => {
    return new SuccessReponse({
      message: 'All categories',
      data: await CategoryService.getCategories()
    }).send(res)
  }

  getCategoryById = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category by id',
      data: await CategoryService.getCategoryById(req.params.id)
    }).send(res)
  }

  updateCategory = async(req, res, next) => {
    const file = req.file
    if (!file) {
      throw new BadRequestError('Please upload a file')
    }
    return new SuccessReponse({
      message: 'Category updated successfully',
      data: await CategoryService.updateCategory(req.params.id, req.body, file)
    }).send(res)
  }

  deleteCategory = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category deleted successfully',
      data: await CategoryService.deleteCategory(req.params.id)
    }).send(res)
  }

  searchCategory = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Search category',
      data: await CategoryService.searchCategory(req.body)
    }).send(res)
  }

  buildCategoryTree = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category tree',
      data: await CategoryService.buildCategoryTree()
    }).send(res)
  }

  getCategoryWithChildren = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category with children',
      data: await CategoryService.getCategoryWithChildren(req.params.id)
    }).send(res)
  }

  getCategoryRoot = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category root',
      data: await CategoryService.getCategoryRoot()
    }).send(res)
  }

  // get quantity for category id
  getStatisticalCategory = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Category statistical',
      data: await CategoryService.getStatisticalCategory(req.params.id)
    }).send(res)
  }

  getStatisticalCategories = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Categories statistical',
      data: await CategoryService.getStatisticalCategories({
        shopId: null,
        sortBy: req.query.sortBy,
        order: req.query.order
      })
    }).send(res)
  }

  getStatisticalCategoryByShop = async(req, res, next) => {
    const _id = req.user._id;
    console.log(_id)
    const shop = await shopModel.findOne({
      owner_id: _id
    }).lean()

    console.log(shop)
    console.log(shop._id)
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    
    return new SuccessReponse({
      message: 'Category statistical by shop',
      data: await CategoryService.getStatisticalCategories({
        shopId: shop._id,
        sortBy: req.query.sortBy,
        order: req.query.order
      })
    }).send(res)
  }

  getStatisticalCategoryByShopId = async(req, res, next) => {
    const id = req.params.shopId;
    console.log(id)
    const shop = await shopModel.findById(id);
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    
    return new SuccessReponse({
      message: 'Category statistical by shop',
      data: await CategoryService.getStatisticalCategories({
        shopId: shop._id,
        sortBy: req.query.sortBy,
        order: req.query.order
      })
    }).send(res)
  }


  // update parent for categories
  moveNode = async(req, res, next) => {
    const { categoryIds, newParentId, newIndex } = req.body
    return new SuccessReponse({
      message: 'Category parent updated successfully',
      data: await CategoryService.moveNode(categoryIds, newParentId, newIndex)
    }).send(res)
  }

  

  
}

module.exports = new CategoryController;