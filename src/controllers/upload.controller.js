const { BadRequestError } = require("../core/error.response");
const { SuccessReponse } = require("../core/success.response");
const shopModel = require("../models/shop.model");
const uploadService = require('../services/upload.service')

const uploadFile = async (req, res, next) => {
    new SuccessReponse({
      message: "File uploaded successfully",
      data: await uploadService.uploadImageFromUrl()
    }).send(res)
};

const uploadThumbnail = async (req, res, next) => {
  const { file } = req
  const id = req.params.id
  if (!file) {
    throw new BadRequestError('File not found')
  }
  const shop = await shopModel.findOne({
    owner_id: req.user._id
  })
  if (!shop) {
    throw new BadRequestError('Shop not found')
  }
  new SuccessReponse({
    message: "File uploaded thumbnail successfully",
    data: await uploadService.uploadProductThumbnail({
      filePath: file.path,
      shopId: shop._id,
      productId: id
    })
  }).send(res)
};

const uploadShopLogo = async (req, res) => {
  const { file } = req
  if (!file) {
    throw new BadRequestError('File not found')
  }
  const shop = await shopModel.findOne({
    owner_id: req.user._id
  })
  if (!shop) {
    throw new BadRequestError('Shop not found')
  }
  new SuccessReponse({
    message: "Shop logo uploaded successfully",
    data: await uploadService.uploadShopLogo({
      filePath: file.path,
      shopId: shop._id
    })
  }).send(res)
};

const uploadProductImage = async (req, res) => {
  const { file } = req
  const { productId } = req.params;
  if (!file) {
    throw new BadRequestError('File not found')
  }
  new SuccessReponse({
    message: "Product image uploaded successfully",
    data: await uploadService.uploadProductImage({
      filePath: file.path,
      productId: productId
    })
  }).send(res)
};

module.exports = {
    uploadFile,
    uploadThumbnail,
    uploadShopLogo,
    uploadProductImage,
}