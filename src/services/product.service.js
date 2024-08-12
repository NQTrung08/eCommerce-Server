'use strict';
const { NotFoundError } = require('../core/error.response');
const productModel = require('../models/product.model');
const shopModel = require('../models/shop.model');
const categoryModel = require('../models/category.model');
const skuModel = require('../models/sku.model');

const newProduct = async (owner_id, body, file) => {
  try {
    const { product_name, product_desc, product_price, stock_status, category_id, product_thumb, variants } = body;
    const shop = await shopModel.findOne({ owner_id });
    const category = await categoryModel.findById(category_id);

    if (!shop) {
      throw new NotFoundError('Shop not found');
    }
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    const product = new productModel({
      shop_id: shop._id,
      product_name,
      product_desc,
      category_id: category._id,
      product_thumb,
      product_price,
      stock_status
    });

    const newSku = variants.map(variantData => new skuModel({
      product_id: product._id,
      ...variantData
    }));

    // Lưu sản phẩm vào cơ sở dữ liệu
    const newProduct = await product.save();
    await skuModel.insertMany(newSku);

    let productThumbUrl = '';

    // Nếu có tệp ảnh, upload ảnh lên Cloudinary
    if (file) {
      const uploadResult = await uploadService.uploadImageFromLocal({
        filePath: file.path,
        folderName: 'product/thumbs',
        ownerId: newProduct.shop_id,
        type: 'thumb',
        id: newProduct._id.toString(), // Truyền ID sản phẩm vào đây
      });
      productThumbUrl = uploadResult.image_url;

      // Cập nhật sản phẩm với URL ảnh
      newProduct.product_thumb = productThumbUrl;
      await newProduct.save();
    }

  } catch (error) {
    console.error('[E]::newProduct::', error);
  }

}

module.exports = {
  newProduct
};
