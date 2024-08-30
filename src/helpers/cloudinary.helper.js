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
      transformation: [
        {
          overlay: 'logo_light_opacity_a3lvrl.png', // ID công khai của logo
          gravity: 'south_east', // Vị trí của logo
          x: 10, // Khoảng cách từ cạnh bên trái
          y: 10, // Khoảng cách từ cạnh dưới
          width: 100, // Chiều rộng của logo
          crop: 'scale' // Điều chỉnh kích thước của logo
        }
      ]
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