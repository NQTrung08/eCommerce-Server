'use strict';
const { NotFoundError } = require('../core/error.response');
const productModel = require('../models/product.model');
const shopModel = require('../models/shop.model');
const categoryModel = require('../models/category.model');
const skuModel = require('../models/sku.model');
const skuService = require('../services/sku.service');

const newProduct = async (owner_id, body, file) => {
  try {
    const { product_name, product_desc, category_id, attributes, stock_status, reviewCount, averageRating, sold_count, skus } = body;
    const shop = await shopModel.findOne({ owner_id });
    const category = await categoryModel.findById(category_id);
    const productExist = await productModel.findOne({ product_name: product_name})
    if (!shop) {
      throw new NotFoundError('Shop not found');
    }
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    if (productExist) {
      throw new Error('Product already exists');
    }
    const product = new productModel({
      shop_id: shop._id,
      product_name,
      product_desc,
      category_id: category._id,
      attributes,
      product_thumb: '',
      stock_status,
      reviewCount,
      averageRating,
      sold_count,
      skus: [],
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const newProduct = await product.save();

    // Tạo và lưu SKUs
    const savedSkus = await skuService.createSkus(skus, newProduct._id);

    // Cập nhật sản phẩm với các SKU đã lưu
    newProduct.skus = savedSkus.map(sku => sku._id);
    await newProduct.save();

    let productThumbUrl = '';

    // Nếu có tệp ảnh, upload ảnh lên Cloudinary
    if (file) {
      const uploadResult = await uploadService.uploadProductThumbnail({
        filePath: file.path,
        shopId: shop._id,
        productId: newProduct._id.toString(), // Sử dụng ID của sản phẩm đã lưu
      });
      productThumbUrl = uploadResult.image_url;

      // Cập nhật sản phẩm với URL ảnh
      newProduct.product_thumb = productThumbUrl;
      await newProduct.save();
    }

    return newProduct;

  } catch (error) {
    console.error('[E]::newProduct::', error);
    throw error;
  }

}

const getAllProducts = async ({
  page = 1,
  limit = 24,
  sortBy = '-createdAt',
}) => {
  try {
    // Kiểm tra các giá trị đầu vào để đảm bảo chúng không phải là undefined
    const pageNumber = Number.isInteger(page) ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(limit) ? parseInt(limit, 10) : 10;

    // Thực hiện truy vấn với phân trang, sắp xếp và chọn trường
    const products = await productModel.find()
      .populate({
        path: 'shop_id',
        select: 'shop_name -_id', // Chọn trường 'shop_name', loại bỏ '_id'
      })
      .populate({
        path: 'category_id',
        select: 'category_name -_id', // Chọn trường 'category_name', loại bỏ '_id'
      })
      .populate({
        path:'skus'
      })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort(sortBy)
      .lean();

    // Lấy tổng số sản phẩm để tính tổng số trang
    const totalCount = await productModel.countDocuments();

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    };
  } catch (error) {
    console.error('[E]::getAllProducts::', error);
    throw error;
  }
};



const getProductById = async (id) => {
  try {
    const product = await productModel.findById(id).populate({
      path:'shop_id',
      select: 'shop_name',
    })
    .populate({
      path:'category_id',
      select: 'category_name',
    })
    .populate({
      path:'skus'
    });
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  } catch (error) {
    console.error('[E]::getProductById::', error);
    throw error;
  }
}

const updateProduct = async (id, body) => {
  try {
    const product = await productModel.findByIdAndUpdate(id, body, { new: true }).populate('category_id shop_id');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  } catch (error) {
    console.error('[E]::updateProduct::', error);
    throw error;
  }
}

const deleteProduct = async (id) => {
  try {
    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await skuModel.deleteMany({ product_id: id });

    return product;
  } catch (error) {
    console.error('[E]::deleteProduct::', error);
    throw error;
  }
}

const searchProducts = async ({
  searchQuery = '',
  page = 1,
  limit = 20,
  sortBy = '-createdAt'
}) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    // Xây dựng truy vấn tìm kiếm
    const query = {
      $text: {
        $search: searchQuery,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    };

    // Xử lý sắp xếp
    let sortQuery = sortBy;
    if (sortBy === 'sold_count') {
      sortQuery = { sold_count: -1 };
    } else {
      sortQuery = { [sortBy]: 1 };
    }

    // Tìm kiếm sản phẩm với phân trang, sắp xếp và chọn trường
    const products = await productModel.find(query)
      .populate({
        path: 'shop_id',
        select: 'shop_name -_id', // Chọn trường 'shop_name', loại bỏ '_id'
      })
      .populate({
        path: 'category_id',
        select: 'category_name -_id', // Chọn trường 'category_name', loại bỏ '_id'
      })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort(sortQuery)
      .lean();

    // Lấy tổng số sản phẩm để tính tổng số trang
    const totalCount = await productModel.countDocuments(query);

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber
    };
  } catch (error) {
    console.error('[E]::searchProducts::', error);
    throw error;
  }
};



module.exports = {
  newProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
