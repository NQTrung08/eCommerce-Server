'use strict';

const { BadRequestError } = require('../core/error.response');
const categoryModel = require('../models/category.model');
const catalogShopModel = require('../models/catalogShop.model');


// SHOP CATEGORY

// POST /api/shop-categories
const createShopCategory = async ({
  shopId,
  catalogName,
  catalogDescription
}) => {

  // Kiểm tra nếu danh mục đã tồn tại cho shop
  const existingCategory = await catalogShopModel.findOne({
    shop_id: shopId,
    catalog_name: catalogName,
    catalog_description: catalogDescription
  });
  if (existingCategory) {
    throw new BadRequestError('Category already exists for this shop');
  }

  const newShopCategory = new catalogShopModel({
    shop_id: shopId,
    catalog_name: catalogName,
    catalog_description: catalogDescription
  });

  await newShopCategory.save();

  return newShopCategory;

};


// GET /api/shop-categories
const getShopCategories = async ({
  shopId
}) => {
  const categories = await catalogShopModel.find({ shop_id: shopId });
  return categories;

};


// DELETE /api/shop-categories/:categoryId
const deleteShopCategory = async ({
  shopId,
  categoryId
}) => {
  try {
    const category = await shopCategoryModel.findOneAndDelete({ shop_id: shopId, category_id: categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Shop category not found' });
    }
    res.status(200).json({ message: 'Shop category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop category', error });
  }
};

module.exports = {
  createShopCategory,
  getShopCategories,
  deleteShopCategory,
};