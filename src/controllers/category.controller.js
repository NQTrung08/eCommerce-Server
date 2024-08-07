'use strict';

const { SuccessReponse, CREATED } = require('../core/success.response');
const CategoryService = require('../services/category.service');

class CategoryController {
  addCategory = async(req, res, next) => {
    return new CREATED({
      message: 'Category created successfully',
      data: await CategoryService.newCategory(req.body)
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
    return new SuccessReponse({
      message: 'Category updated successfully',
      data: await CategoryService.updateCategory(req.params.id, req.body)
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

  
}

module.exports = new CategoryController;