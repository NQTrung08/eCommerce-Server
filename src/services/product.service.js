'use strict';
const { NotFoundError } = require('../core/error.response');
const productModel = require('../models/product.model');
const shopModel = require('../models/shop.model');
const categoryModel = require('../models/category.model');
const skuModel = require('../models/sku.model');

const newProduct = async(owner_id, body) => {
  try {
    const {product_name, product_desc, product_price, stock_status, category_id, product_thumb, variants} = body;
    const shop = await shopModel.findOne({owner_id});
    const category = await categoryModel.findById(category_id);
    
    if (!shop) {
      throw new NotFoundError('Shop not found');
    }
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    const newProduct = new productModel({
      shop_id: shop._id,
      product_name,
      product_desc,
      category_id: category._id,
      product_thumb,
      product_price,
      stock_status
    });

    const newSku = variants.map(variantData => new skuModel({
      product_id: newProduct._id,
      ...variantData
    }));

    await newProduct.save();
    await skuModel.insertMany(newSku);

    
  } catch (error) {
    console.error('[E]::newProduct::', error);
  }

}

module.exports = {
  newProduct
};
