'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const categoryModel = require('../models/category.model');
const mongoose = require('mongoose');
const { uploadCategoryImage } = require('./upload.service');
const productModel = require('../models/product.model');
const reviewModel = require('../models/review.model');
const orderModel = require('../models/order.model');

const newCategory = async ({
  category_name,
  parent_id,
  file,
}) => {

  const category = await categoryModel.findOne({
    category_name
  });

  console.log(category_name);

  if (!category_name || category_name.trim() === '') {
    throw new BadRequestError('Category name is required');
  }

  if (category) {
    throw new BadRequestError('Category already exists');
  }

  if (category?.isDeleted) {
    throw new BadRequestError('Category exists and is in the trash');
  }

  let parentCategory = null;
  if (parent_id) {
    if (!mongoose.Types.ObjectId.isValid(parent_id)) {
      throw new BadRequestError('Invalid parent_id');
    }
    parentCategory = await categoryModel.findById(parent_id);
    if (!parentCategory) {
      throw new BadRequestError('Parent category not found');
    }
  }

  // upload images
  const uploadResult = await uploadCategoryImage({
    filePath: file.path,
    categoryId: category_name,
  });


  const newCategory = await categoryModel.create({
    category_name,
    parent_id: parentCategory ? parent_id : null,
    level: parentCategory ? parentCategory.level + 1 : 0,
    category_img: uploadResult.url,
  });



  return newCategory;
}


const getCategories = async () => {

  const categories = await categoryModel.find({
    isSystemCategory: true,
  }).populate('parent_id');

  return categories;

}

const getCategoryById = async (id) => {
  const category = await categoryModel.findById(id).populate('parent_id');
  return category;
}

const updateCategory = async (id, body, file) => {
  if (id == body.parent_id) {
    throw new BadRequestError('Parent category cannot be the same as the current category');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid id');
  }
  const parentId = body.parent_id && body.parent_id.trim() !== "" ? body.parent_id : null;

  let level = 0;
  if (parentId) {
    const parentCategory = await categoryModel.findById(parentId);
    if (!parentCategory) {
      throw new NotFoundError('Parent category not found');
    }
    level = parentCategory.level + 1;
  }

  const uploadResult = await uploadCategoryImage({
    filePath: file.path,
    categoryId: category_name,
  });


  const category = await categoryModel.findByIdAndUpdate(id, {
    category_name: body.category_name,
    parent_id: parentId,
    level: level,
    category_img: uploadResult.url,
  }, {
    new: true,
  });
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
}

const deleteCategory = async (id) => {
  try {
    const categoryToDelete = await categoryModel.findById(id);
    if (!categoryToDelete) {
      throw new NotFoundError('Category not found');
    }
    // Xác định danh mục cha gần nhất
    const parentCategory = await categoryModel.findById(categoryToDelete.parent_id);

    // Cập nhật parentId của các danh mục con
    await categoryModel.updateMany(
      { parent_id: id },
      {
        $set: {
          parent_id: parentCategory._id,
          level: parentCategory.level + 1
        }
      });
    // Xóa danh mục hiện tại
    // await categoryModel.findByIdAndDelete(id);
    await categoryToDelete.deleteOne();
    return { message: 'Category deleted successfully' };
  } catch (error) {
    console.error('[E]::deleteCategory::', error);
    throw error;
  }
}

const buildCategoryTree = async () => {
  try {
    const categories = await categoryModel.find({}).lean();

    // Function to build a tree from the flat list
    const buildTree = (parentId = null) => {
      return categories
        .filter(category => (category.parent_id ? category.parent_id.toString() : null) === (parentId ? parentId.toString() : null))
        .map(category => ({
          ...category,
          children: buildTree(category._id)
        }));
    };

    const categoryTree = buildTree();

    return categoryTree;
  } catch (error) {
    console.error('[E]::buildCategoryTree::', error);
    throw error;
  }
};

const getCategoryRoot = async () => {
  try {
    const categories = await categoryModel.find({}).lean();

    // Function to build a tree from the flat list
    const buildTree = (parentId = null) => {
      return categories
        .filter(category => (category.parent_id ? category.parent_id.toString() : null) === (parentId ? parentId.toString() : null))
        .map(category => ({
          ...category,
          // children: buildTree(category._id)
        }));
    };

    const categoryTree = buildTree();

    return categoryTree;
  } catch (error) {
    console.error('[E]::getCategoryRoot::', error);
    throw error;
  }
};

const searchCategory = async ({ category_name }) => {
  try {
    const categories = await categoryModel.find({
      category_name: category_name,
    }).populate({
      path: 'parent_id'
    })
      .lean();

    // Hàm đệ quy để tìm danh mục gốc
    const findRootCategory = async (category) => {
      while (category.parent_id) {
        // Tiếp tục tìm danh mục cha cho đến khi không còn cha nữa
        category = await categoryModel.findById(category.parent_id._id).populate('parent_id').lean();
      }
      return category;
    };

    // Tìm danh mục gốc cho tất cả các danh mục đã tìm thấy
    const rootCategoriesPromises = categories.map(async (category) => await findRootCategory(category));
    const rootCategories = await Promise.all(rootCategoriesPromises);

    // Xóa trùng lặp và trả về danh sách danh mục gốc
    const uniqueRootCategories = Array.from(new Map(rootCategories.map(cat => [cat._id.toString(), cat])).values());

    return uniqueRootCategories;

  } catch (error) {
    console.error('[E]::searchCategory::', error);
    throw error;
  }
}

// get category children from id
const getCategoryWithChildren = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid id');
  }

  const category = await categoryModel.findById(id).lean();
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const categories = await categoryModel.find({}).lean();

  // Function to build a tree from the flat list
  const buildTree = (parentId) => {
    return categories
      .filter(cat => (cat.parent_id ? cat.parent_id.toString() : null) === (parentId ? parentId.toString() : null))
      .map(cat => ({
        ...cat,
        // children: cat._id
      }));
  };

  // Build the tree starting from the given category ID
  category.children = buildTree(id);

  return category;

};

// getStatisticalCategory
const getStatisticalCategory = async (id) => {
  // Tìm ngành hàng theo ID
  const category = await categoryModel.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Đếm tổng số lượng sản phẩm trong ngành hàng này
  const totalProducts = await productModel.countDocuments({ category_id: id });

  // Tính tổng doanh thu từ các sản phẩm trong ngành hàng
  const orders = await orderModel.aggregate([
    { $unwind: "$order_products" },  // Tách mảng order_products thành từng dòng riêng biệt
    {
      $lookup: {
        from: 'products',           // Tên collection chứa sản phẩm
        localField: 'order_products.productId',
        foreignField: '_id',
        as: 'product_info'
      }
    },
    { $unwind: "$product_info" },      // Tách mảng product_info (kết quả lookup) thành từng dòng
    {
      $match: {
        "product_info.category_id": id  // Lọc theo ngành hàng ID
      }
    },
    {
      $group: {
        _id: "$product_info.category_id",
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

  // Chuẩn bị kết quả thống kê
  const statisticalCategory = {
    categoryName: category.name,
    totalProducts,
    totalRevenue: orders[0]?.totalRevenue || 0  // Doanh thu tổng cho ngành hàng hoặc 0 nếu không có đơn hàng nào
  };

  return statisticalCategory;
};

// statistical for category root
const getStatisticalCategories = async ({
  shopId, sortBy, order
}) => {
  const rootCategories = await categoryModel.find({ parent_id: null });
  if (rootCategories.length === 0) {
    throw new NotFoundError('No root categories found');
  }

  const statistics = [];

  for (const category of rootCategories) {
    const categoryIds = await categoryModel.find({
      $or: [
        { _id: category._id },
        { parent_id: category._id }
      ]
    }).distinct('_id');

    // Nếu là admin, tính tất cả sản phẩm
    let totalProducts, matchCriteria;
    if (!shopId) {
      totalProducts = await productModel.countDocuments({ category_id: { $in: categoryIds } });
      matchCriteria = { "product_info.category_id": { $in: categoryIds } };
    } else {
      // Nếu là shop, chỉ tính sản phẩm của cửa hàng
      totalProducts = await productModel.countDocuments({
        category_id: { $in: categoryIds },
        shop_id: shopId // Chỉ lấy sản phẩm của cửa hàng này
      });
      matchCriteria = {
        "product_info.category_id": { $in: categoryIds },
        "product_info.shop_id": shopId // Lọc theo shop_id
      };
    }

    // Tính doanh thu
    const orders = await orderModel.aggregate([
      { $unwind: "$order_products" },
      {
        $lookup: {
          from: 'products',
          localField: 'order_products.productId',
          foreignField: '_id',
          as: 'product_info'
        }
      },
      { $unwind: "$product_info" },
      {
        $match: matchCriteria // Lọc theo điều kiện
      },
      {
        $group: {
          _id: "$product_info.category_id",
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

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalRevenue, 0);

    if (shopId && (totalProducts > 0 || totalRevenue > 0)) { // nếu là shop thì trả về những category có doanh thu hoặc sản phẩm
      statistics.push({
        _id: category._id,
        categoryName: category.category_name,
        totalProducts,
        totalRevenue
      });
    } else if(!shopId) { // nếu kp shop thì trả về tất cả category
      statistics.push({
        _id: category._id,
        categoryName: category.category_name,
        totalProducts,
        totalRevenue
      });
    }
  }

  // Sắp xếp
  statistics.sort((a, b) => {
    const compareValue = (sortBy === 'income' ? b.totalRevenue - a.totalRevenue : b.totalProducts - a.totalProducts);
    return order === 'asc' ? -compareValue : compareValue;
  });

  return statistics;
}



module.exports = {
  newCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  buildCategoryTree,
  searchCategory,
  getCategoryWithChildren,
  getCategoryRoot,
  getStatisticalCategory,
  getStatisticalCategories
};