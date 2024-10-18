'use strict';

const { uploadToCloudinary } = require('../helpers/cloudinary.helper');
const cloudinary = require('../configs/cloudinary.config');
// Ví dụ service cụ thể cho shop logo
const uploadShopLogo = async ({ filePath, shopId }) => {
  const folder = `shops/${shopId}/logo`;
  const publicId = `${shopId}-logo`;
  return await uploadToCloudinary({ filePath, folder, publicId });
};

// Ví dụ service cụ thể cho user avatar
const uploadUserAvatar = async ({ filePath, userId }) => {
  const folder = `users/${userId}/avatar`;
  const publicId = `${userId}-avatar`;
  return await uploadToCloudinary({ filePath, folder, publicId });
};

// Ví dụ service cụ thể cho product thumbnail
const uploadProductThumbnail = async ({ filePath, shopId, productId }) => {
  try {

    
    const folder = `products/${shopId}/${productId}/thumbnail`;
    const publicId = `${productId}-thumbnail`;
    const result = await uploadToCloudinary({ filePath, folder, publicId });
    
    return {
      image_url: result.secure_url,
      thumb_url: await cloudinary.url(result.public_id, {
        width: 100,
        height: 100,
        crop: 'thumb'
      })
    };
  } catch (e) {
    console.error('[E]::uploadProductThumbnail::', e);
    throw e;
  }
};

// Ví dụ service cụ thể cho product SKU
const uploadProductSKU = async ({ filePath, shopId, productId, skuId }) => {
  const folder = `products/${shopId}/${productId}/sku/${skuId}`;
  const publicId = `${productId}-sku-${skuId}`;
  return await uploadToCloudinary({ filePath, folder, publicId });
};

// service cho ảnh chung chung
const uploadGeneralImage = async ({ filePath, category }) => {
  const folder = `general/${category}`;
  const publicId = `${category}-${new Date().getTime()}`;
  return await uploadToCloudinary({ filePath, folder, publicId });
};

// service cho ảnh category
const uploadCategoryImage = async ({ filePath, categoryId }) => {
  const folder = `categories/${categoryId}`;
  const publicId = `${categoryId}-${new Date().getTime()}`;
  return await uploadToCloudinary({ filePath, folder, publicId });
};

module.exports = {
  uploadShopLogo,
  uploadUserAvatar,
  uploadProductThumbnail,
  uploadProductSKU,
  uploadGeneralImage,
  uploadCategoryImage,
};
