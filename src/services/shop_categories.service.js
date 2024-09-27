'use strict';

const { BadRequestError } = require('../core/error.response');
const categoryModel = require('../models/category.model');
const shopCategoryModel = require('../models/shop_categories.model');


// SHOP CATEGORY

// POST /api/shop-categories
const createShopCategory = async ({
  shopId,
  categoryId
}) => {
  try {
    // Kiểm tra nếu danh mục đã tồn tại cho shop
    const existingCategory = await shopCategoryModel.findOne({ shop_id: shopId, category_id: categoryId });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists for this shop' });
    }

    const newShopCategory = new shopCategoryModel({
      shop_id: shopId,
      category_id: categoryId
    });

    await newShopCategory.save();
    res.status(201).json({ message: 'Shop category created successfully', shopCategory: newShopCategory });
  } catch (error) {
    res.status(500).json({ message: 'Error creating shop category', error });
  }
};


// GET /api/shop-categories
const getShopCategories = async ({
  shopId
}) => {
  try {
    const categories = await shopCategoryModel.find({ shop_id: shopId });
    return categories;
  } catch (error) {
    res.status(500).json({ message: 'Error getting shop categories', error });
  }
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