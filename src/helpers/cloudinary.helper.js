'use strict';

const cloudinary = require('../configs/cloudinary.config');

/**
 * Upload file lên Cloudinary
 * @param {string} filePath - Đường dẫn tới file cần upload
 * @param {string} folder - Tên folder trên Cloudinary để lưu trữ ảnh
 * @param {string} publicId - ID công khai của ảnh trên Cloudinary
 * @returns {Promise<Object>} - Thông tin ảnh đã upload
 */

// 1. upload from local file

const uploadToCloudinary = async({
  filePath, folder, publicId
}) => {
  try {

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: publicId,
    });
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}

module.exports = {
  uploadToCloudinary,
}