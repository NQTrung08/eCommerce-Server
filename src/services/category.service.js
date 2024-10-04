'use strict';

const { BadRequestError } = require('../core/error.response');
const categoryModel = require('../models/category.model');
const mongoose = require('mongoose');

const newCategory = async (body) => {

    const category = await categoryModel.findOne({
      category_name: body.category_name
    });

    if (!body.category_name || body.category_name.trim() === '') {
      throw new BadRequestError('Category name is required');
    }

    if (category) {
      throw new BadRequestError('Category already exists');
    }

    if (category?.isDeleted) {
      throw new BadRequestError('Category exists and is in the trash');
    }

    let parentCategory = null;
    if (body.parent_id) {
      if (!mongoose.Types.ObjectId.isValid(body.parent_id)) {
        throw new BadRequestError('Invalid parent_id');
      }
      parentCategory = await categoryModel.findById(body.parent_id);
      if (!parentCategory) {
        throw new BadRequestError('Parent category not found');
      }
    }

    const newCategory = await categoryModel.create({
      category_name: body.category_name,
      parent_id: parentCategory ? body.parent_id : null,
      level: parentCategory ? parentCategory.level + 1 : 0,
    });

    return newCategory;
}


const getCategories = async () => {
  try {
    const categories = await categoryModel.find({
      isSystemCategory: true,
    }).populate('parent_id');
    return categories;
  } catch (error) {
    console.error('[E]::getCategories::', error);
    throw error;
  }
}

const getCategoryById = async (id) => {
  try {
    const category = await categoryModel.findById(id).populate('parent_id');
    return category;
  } catch (error) {
    console.error('[E]::getCategoryById::', error);
    throw error;
  }
}

const updateCategory = async (id, body) => {
  try {

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

    const category = await categoryModel.findByIdAndUpdate(id, {
      category_name: body.category_name,
      parent_id: parentId,
      level: level
    }, {
      new: true,
    });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  } catch (error) {
    console.error('[E]::updateCategory::', error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error('[E]::getCategoryWithChildren::', error);
    throw error;
  }
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
};