'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessReponse } = require('../core/success.response');
const productModel = require('../models/product.model');
const shopModel = require('../models/shop.model');
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
        body: req.body,
        files: req.files
      })
    }).send(res)
  }

  moveTrashProducts = async (req, res, next) => {
    const id = req.user._id
    const { ids } = req.body;

    console.log("íds", ids)

    // Kiểm tra xem mảng ids có tồn tại và có ít nhất một phần tử không
    if (ids.length == 0) {
      throw new BadRequestError('No product IDs provided for deletion')
    }

    const shop = await shopModel.findOne({
      owner_id: id
    })

    console.log('shop', shop)
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    // Kiểm tra xem tất cả sản phẩm có tồn tại trong shop không
    const existingProducts = await productModel.find({
      _id: { $in: ids },
      shop_id: shop._id
    });

    if (!existingProducts) {
      throw new BadRequestError('One or more products not found in this shop');
    }

    // Xóa sản phẩm
    return new SuccessReponse({
      message: 'Product deleted successfully',
      data: await ProductService.moveTrashProducts(ids)
    }).send(res)
  }

  searchProducts = async (req, res, next) => {
    const { searchQuery, page, limit, sortBy, category } = req.query;
    return new SuccessReponse({
      message: 'Search Products',
      data: await ProductService.searchProducts({
        searchQuery: searchQuery || '',
        category: category || '',
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

  getProductsByCatalogShop = async (req, res, next) => {
    const { shopId, catalogId } = req.params;
    if (!shopId || !catalogId) {
      throw new BadRequestError('Shop id and catalog id is required');
    }
    return new SuccessReponse({
      message: 'Get products by shop id and catalog id',
      data: await ProductService.getProductsByCatalogShop({
        shopId,
        catalogId
      })
    }).send(res)
  }

  getProductsByShopId = async (req, res, next) => {
    const { shopId } = req.params;
    if (!shopId) {
      throw new BadRequestError('Shop id is required');
    }
    return new SuccessReponse({
      message: 'Get products by shop id',
      data: await ProductService.getProductsByShopId({
        shopId
      })
    }).send(res)
  }

  // add products to catalog shop
  addProductsToCatalogShop = async (req, res, next) => {
    const { _id } = req.user;
    const { catalogId } = req.params;
    const { productIds } = req.body;
    const shop = await shopModel.findOne({
      owner_id: _id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    if (!shop._id || !catalogId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestError('Invalid input');
    }
    return new SuccessReponse({
      message: 'Products added to catalog shop successfully',
      data: await ProductService.addProductsToCatalog({
        shopId: shop._id,
        catalogId,
        productIds
      })
    }).send(res)
  }

  // filter products by category id
  getProductsByCategoryId = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      throw new BadRequestError('Category id is required');
    }
    return new SuccessReponse({
      message: 'Get products by category id',
      data: await ProductService.getProductsByCategoryId({
        categoryId
      })
    }).send(res)
  }

  getAllProductsForShop = async (req, res, next) => {
    const id = req.user._id

    const filters = {
      isDraft: req.query.isDraft === 'true',
      isPublic: req.query.isPublic === 'true',
      isDeleted: req.query.isDeleted === 'true'
    };

    // Kiểm tra nếu tất cả filter đều không được truyền, mặc định là isPublic: true
    if (!req.query.isDraft && !req.query.isPublic && !req.query.isDeleted) {
      filters.isPublic = true;
    }

    console.log("id", id)

    const shop = await shopModel.findOne({
      owner_id: id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    console.log('shop', shop)
    return new SuccessReponse({
      message: 'Get product for shop',
      data: await ProductService.getProductsByShopId({
        shopId: shop._id,
        filters
      })
    }).send(res)
  }


  getCountProduct = async (req, res) => {
    const id = req.user._id
    const shop = await shopModel.findOne({
      owner_id: id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    return new SuccessReponse({
      message: 'Get count products for shop',
      data: await ProductService.getCountProduct({
        shopId: shop._id,
      })
    }).send(res)

  }

  deleteProducts = async (req, res, next) => {
    const id = req.user._id
    const { ids } = req.body;
    // Kiểm tra xem mảng ids có tồn tại và có ít nhất một phần tử không
    if (ids.length == 0) {
      throw new BadRequestError('No product IDs provided for deletion')
    }

    const shop = await shopModel.findOne({
      owner_id: id
    })

    console.log('shop', shop)
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    // Kiểm tra xem tất cả sản phẩm có tồn tại trong shop không
    const existingProducts = await productModel.find({
      _id: { $in: ids },
      shop_id: shop._id
    });

    if (!existingProducts) {
      throw new BadRequestError('One or more products not found in this shop');
    }

    // Xóa sản phẩm
    return new SuccessReponse({
      message: 'Product deleted successfully',
      data: await ProductService.deleteProducts(ids)
    }).send(res)
  }

}

module.exports = new ProductController;