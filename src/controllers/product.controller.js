'use strict';

const { SuccessReponse } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
  newProduct = async (req, res, next) => {
    const owner_id = req.user._id; // Giả sử bạn có thông tin người dùng trong req.user
    const body = req.body;
    const files = req.files; // Giả sử bạn đang sử dụng middleware như multer để xử lý file upload

    // Tạo sản phẩm mới
    const newProduct = await ProductService.newProduct(owner_id, body, files);

    return new SuccessReponse({
      message: 'Product created successfully',
      data: newProduct
    }).send(res)
  }

  getAllProducts = async (req, res, next) => {
    return new SuccessReponse({
      message: 'All products',
      data: await ProductService.getAllProducts({
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
      })
    }).send(res)
  }

  getProductById = async (req, res, next) => {
    return new SuccessReponse({
      message: 'Product by id',
      data: await ProductService.getProductById(req.params.id)
    }).send(res)
  }

  updateProduct = async (req, res, next) => {
    return new SuccessReponse({
      message: 'Product updated successfully',
      data: await ProductService.updateProduct({
        userId: req.user._id,
        id: req.params.id,
        body: req.body
      })
    }).send(res)
  }

  deleteProducts = async (req, res, next) => {

    const { ids } = req.body;

  // Kiểm tra xem mảng ids có tồn tại và có ít nhất một phần tử không
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send({
      message: 'No product IDs provided for deletion',
    });
  }

    return new SuccessReponse({
      message: 'Product deleted successfully',
      data: await ProductService.deleteProducts(ids)
    }).send(res)
  }

  searchProducts = async (req, res, next) => {
    const { searchQuery, page, limit, sortBy } = req.query;
    return new SuccessReponse({
      message: 'Search Products',
      data: await ProductService.searchProducts({
        searchQuery: searchQuery || '',
        page: page || 1,
        limit: limit || 10,
        sortBy: sortBy || '-createdAt'
      })
    }).send(res)


  };

  publicProducts = async (req, res, next) => {
    const { ids } = req.body;

  // Kiểm tra xem mảng ids có tồn tại và có ít nhất một phần tử không
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send({
      message: 'No product IDs provided for deletion',
    });
  }
    return new SuccessReponse({
      message: 'Public Products',
      data: await ProductService.publicProducts(ids)
    }).send(res)
  }
  privateProducts = async (req, res, next) => {
    const { ids } = req.body;

  // Kiểm tra xem mảng ids có tồn tại và có ít nhất một phần tử không
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send({
      message: 'No product IDs provided for deletion',
    });
  }

    return new SuccessReponse({
      message: 'Private Products',
      data: await ProductService.privateProducts(ids)
    }).send(res)
  }

  getProductsByShopIdAndCategoryId = async (req, res, next) => {
    const { shopId, categoryId } = req.params;
    if (!shopId ||!categoryId) {
     throw new BadRequestError('Shop id and category id is required');
    }
    return new SuccessReponse({
      message: 'Get products by shop id and category id',
      data: await ProductService.getProductsByShopIdAndCategoryId({
        shopId,
        categoryId
      })
    }).send(res)
  }



}

module.exports = new ProductController;