'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
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


// GET /api/catalogShop/
const getShopCategories = async ({
  shopId
}) => {
  const categories = await catalogShopModel.find({ shop_id: shopId });
  return categories;

};

// UPDATE /api/catalogShop/:catalogId
const updateCatalogShop = async ({
  shopId,
  catalogId,
  catalogName,
  catalogDescription
}) => {

  const catalogShop = await catalogShopModel.findOneAndUpdate(
    {
      _id: catalogId,
      shop_id: shopId
    },
    { catalog_name: catalogName, catalog_description: catalogDescription },
    { new: true }
  );
  if (!catalogShop) {
    throw new NotFoundError('Catalog not found');
  }
  return catalogShop;
};



// DELETE /api/shop-categories/:categoryId
const deleteCatalogShop = async ({
  shopId,
  catalogId
}) => {
  const catalog = await catalogShopModel.findOneAndDelete({
    shop_id: shopId,
    _id: catalogId
  });
  if (!catalog) {
    throw new NotFoundError('Catalog of shop not found');
  }

  return catalog;

};

module.exports = {
  createShopCategory,
  getShopCategories,
  updateCatalogShop,
  deleteCatalogShop
};