'use strict';

const { SuccessReponse } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
  addProduct = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Product created successfully',
      data: await ProductService.newProduct(req.user._id, req.body)
    }).send(res)
  }
  
}

module.exports = new ProductController;