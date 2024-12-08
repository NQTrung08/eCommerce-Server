'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const categoryModel = require('../models/category.model');
const catalogShopModel = require('../models/catalogShop.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');


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


const getStatisticalCatalogByShopId = async ({ shopId, sortBy, order }) => {
  if (!shopId) {
    throw new Error("Shop ID is required");
  }

  // Lấy tất cả các catalog
  const allCatalogs = await catalogShopModel.find({
    shop_id: shopId,
  });
  if (allCatalogs.length === 0) {
    throw new NotFoundError("No catalogs found");
  }

  const statistics = [];

  for (const catalog of allCatalogs) {
    // Đếm số lượng sản phẩm thuộc catalog này của shop
    const totalProducts = await productModel.countDocuments({
      catalog_id: catalog._id,
      shop_id: shopId
    });

    // Tính doanh thu thuộc catalog này
    const orders = await orderModel.aggregate([
      { $unwind: "$order_products" },
      {
        $lookup: {
          from: "Products",
          localField: "order_products.productId",
          foreignField: "_id",
          as: "product_info"
        }
      },
      { $unwind: "$product_info" },
      {
        $match: {
          "product_info.catalog_id": catalog._id,
          "product_info.shop_id": shopId // Chỉ lọc theo shop này
        }
      },
      {
        $group: {
          _id: "$product_info.catalog_id",
          totalRevenue: {
            $sum: {
              $multiply: [
                "$order_products.quantity",
                "$order_products.price"
              ]
            }
          }
        }
      }
    ]);

    const totalRevenue = orders.length > 0 ? orders[0].totalRevenue : 0;

    // Chỉ thêm vào danh sách nếu có sản phẩm hoặc doanh thu
    if (totalProducts > 0 || totalRevenue > 0) {
      statistics.push({
        _id: catalog._id,
        catalogName: catalog.catalog_name,
        totalProducts,
        totalRevenue
      });
    }
  }

  // Sắp xếp theo tiêu chí (income hoặc products)
  statistics.sort((a, b) => {
    const compareValue = sortBy === "income" ? b.totalRevenue - a.totalRevenue : b.totalProducts - a.totalProducts;
    return order === "asc" ? -compareValue : compareValue;
  });

  return statistics;
};


module.exports = {
  createShopCategory,
  getShopCategories,
  updateCatalogShop,
  deleteCatalogShop,
  getStatisticalCatalogByShopId
};