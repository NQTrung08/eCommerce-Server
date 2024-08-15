// sku.service.js
'use strict';

const skuModel = require('../models/sku.model');
const {  } = require('../core/error.response');

const createSkus = async (skusData, productId) => {
  try {
    // Tạo danh sách SKU
    const skusToCreate = skusData.map(skuData => ({
      ...skuData,
      product_id: productId,
    }));

    // Lưu các SKU vào cơ sở dữ liệu
    const savedSkus = await skuModel.insertMany(skusToCreate);

    return savedSkus;
  } catch (error) {
    console.error('[E]::createSkus::', error);
    throw error;
  }
}

module.exports = {
  createSkus,
};
