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
  let order = 0;
  if (parent_id) {
    if (!mongoose.Types.ObjectId.isValid(parent_id)) {
      throw new BadRequestError('Invalid parent_id');
    }
    parentCategory = await categoryModel.findById(parent_id);
    if (!parentCategory) {
      throw new BadRequestError('Parent category not found');
    }


    // Tìm số lượng node con hiện có của `parent_id`
    const siblingCount = await categoryModel.countDocuments({ parent_id });
    order = siblingCount;
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
    order
  });



  return newCategory;
}


const getCategories = async () => {

  const categories = await categoryModel.find().populate('parent_id');

  return categories;

}

const getCategoryById = async (id) => {
  const category = await categoryModel.findById(id).populate('parent_id');
  return category;
}

const updateCategory = async (id, body, file) => {
  // Kiểm tra nếu parent_id trùng với id của chính nó
  if (id == body.parent_id) {
    throw new BadRequestError('Parent category cannot be the same as the current category');
  }

  // Kiểm tra id hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid id');
  }

  const categoryUpdate = {};

  // Xử lý parent_id (nếu có)
  if (body.parent_id && body.parent_id.trim() !== "" && body.parent_id !== id) {
    const parentCategory = await categoryModel.findById(body.parent_id);
    if (!parentCategory) {
      throw new NotFoundError('Parent category not found');
    }
    categoryUpdate.parent_id = body.parent_id;
    categoryUpdate.level = parentCategory.level + 1;
  }

  // Kiểm tra và cập nhật tên category
  if (body.category_name) {
    categoryUpdate.category_name = body.category_name;
  }

  // Kiểm tra và cập nhật hình ảnh category (nếu có)
  if (file && file.path) {
    const uploadResult = await uploadCategoryImage({
      filePath: file.path,
      categoryId: body.category_name,
    });
    categoryUpdate.category_img = uploadResult.url;
  }

  // Cập nhật category trong cơ sở dữ liệu
  const category = await categoryModel.findByIdAndUpdate(id, categoryUpdate, {
    new: true,
  });

  // Nếu không tìm thấy category
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};


const deleteCategory = async (id) => {
  const categoryToDelete = await categoryModel.findById(id);
  if (!categoryToDelete) {
    throw new NotFoundError('Category not found');
  }

  // Kiểm tra xem danh mục có children không
  const hasChildren = await categoryModel.exists({ parent_id: id });
  if (hasChildren) {
    throw new BadRequestError('Cannot delete category because it has subcategories.');
  }

  // Xác định danh mục cha gần nhất (nếu có)
  const parentCategory = await categoryModel.findById(categoryToDelete.parent_id);

  // Cập nhật parentId của các danh mục con
  await categoryModel.updateMany(
    { parent_id: id },
    {
      $set: {
        parent_id: parentCategory ? parentCategory._id : null,
        level: parentCategory ? parentCategory.level + 1 : 0
      }
    });

  // Xóa danh mục hiện tại
  await categoryToDelete.deleteOne();
  return { message: 'Category deleted successfully' };
}


const buildCategoryTree = async () => {
  const categories = await categoryModel.find({}).lean();

  // Function to build a tree from the flat list
  const buildTree = (parentId = null) => {
    return categories
      .filter(category => (category.parent_id ? category.parent_id.toString() : null) === (parentId ? parentId.toString() : null))
      .sort((a, b) => a.order - b.order) // Sắp xếp theo order
      .map(category => ({
        ...category,
        children: buildTree(category._id) // Tiếp tục đệ quy xây dựng cây cho danh mục con
      }));
  };

  const categoryTree = buildTree();

  return categoryTree;
};


const getCategoryRoot = async () => {
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
      .map(category => ({
        ...category,
        children: buildTree(category._id) // Tiếp tục đệ quy xây dựng cây cho danh mục con
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
          from: 'Products',
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

    console.log("orders", orders);

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalRevenue, 0);

    if (shopId && (totalProducts > 0 || totalRevenue > 0)) { // nếu là shop thì trả về những category có doanh thu hoặc sản phẩm
      statistics.push({
        _id: category._id,
        categoryName: category.category_name,
        totalProducts,
        totalRevenue
      });
    } else if (!shopId) { // nếu kp shop thì trả về tất cả category
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


// update parent for [ids]
const moveNode = async (ids, newParentId, newIndex) => {
  // Kiểm tra xem các danh mục có tồn tại không
  const categories = await categoryModel.find({ _id: { $in: ids } });
  if (categories.length !== ids.length) {
    throw new NotFoundError('Không tìm thấy một hoặc nhiều danh mục');
  }

  // Kiểm tra xem danh mục cha mới có tồn tại không
  const newParent = await categoryModel.findById(newParentId);
  if (!newParent && newParentId !== null) {
    throw new NotFoundError('Không tìm thấy danh mục cha mới');
  }

  // Kiểm tra xem danh mục cha mới không phải là chính danh mục cần di chuyển
  if (ids.includes(newParentId?.toString())) {
    throw new BadRequestError('Danh mục không thể là cha của chính nó');
  }

  // Lấy tất cả các danh mục con của danh mục cha mới, sắp xếp theo thứ tự hiện tại
  const siblingCategories = await categoryModel.find({ parent_id: newParentId }).sort({ order: 1 });

  // Loại bỏ các danh mục đang được di chuyển khỏi danh sách
  const remainingSiblings = siblingCategories.filter(cat => !ids.includes(cat._id.toString()));

  // Chèn các danh mục cần di chuyển vào vị trí `newIndex`
  const reorderedCategories = [
    ...remainingSiblings.slice(0, newIndex),
    ...ids.map(id => ({ _id: id })),
    ...remainingSiblings.slice(newIndex)
  ];

  // Cập nhật `order` và `level` cho từng danh mục trong danh sách đã sắp xếp lại
  const bulkUpdates = reorderedCategories.map((cat, index) => ({
    updateOne: {
      filter: { _id: cat._id },
      update: { 
        parent_id: newParentId, 
        order: index,
        // Cập nhật level dựa vào cấp độ của danh mục cha mới
        level: newParent ? newParent.level + 1 : 0  // Cấp độ của danh mục con sẽ là cấp độ của cha + 1
      }
    }
  }));

  const updateResult = await categoryModel.bulkWrite(bulkUpdates);

  // Kiểm tra xem có danh mục nào được cập nhật không
  if (updateResult.modifiedCount === 0) {
    throw new NotFoundError('Không có danh mục nào được cập nhật');
  }

  // Lấy danh mục đã cập nhật để trả về
  return categoryModel.find({ _id: { $in: ids } });
};




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
  getStatisticalCategories,
  moveNode
};