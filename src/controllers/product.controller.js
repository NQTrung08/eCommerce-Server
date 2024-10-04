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
      data: await newProduct
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
      data: await ProductService.updateProduct(req.params.id, req.body)
    }).send(res)
  }

  deleteProduct = async (req, res, next) => {

    return new SuccessReponse({
      message: 'Product deleted successfully',
      data: await ProductService.deleteProduct(req.params.id)
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


}

module.exports = new ProductController;