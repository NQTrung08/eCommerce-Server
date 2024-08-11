'use strict';

const cloudinary = require('../configs/cloudinary.config')
// 1. upload from url image

const uploadImageFromUrl = async() => {
  try {
    const urlImage = 'https://hovo.vn/wp-content/uploads/2021/08/HDH_7872.jpg'
    const folderName = 'product/shopId'
    const newFileName = 'test1'

    const result = await cloudinary.uploader.upload( urlImage, {
      public_id: newFileName,
      folder: folderName,
    })
    
    return result
  }catch (e) {
    console.error(e)
  }
}

// 2. upload from local file

const uploadImageFromLocal = async({
  filePath,
  folderName,
  shopId,
}) => {
  try {
    const fullFolderName = `${folderName}/${shopId}`;
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: 'thumb',
      folder: fullFolderName,
    })

    return {
      image_url: result.secure_url,
      shop_id: shopId,
    }
  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
}