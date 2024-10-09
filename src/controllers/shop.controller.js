
const { BadRequestError } = require('../core/error.response');
const { CREATED, SuccessReponse } = require('../core/success.response');
const ShopService = require('../services/shop.service');



class ShopController {
  newShop = async(req, res, next) => {
    return new CREATED({
      message: 'Shop created successfully',
      data: await ShopService.newShop({
        owner_id: req.user._id,
        body: req.body,
        file: req.file,
      })
    }).send(res)
  }

  getAllShopForUser = async(req, res, next) => {
    return new SuccessReponse({
      message: 'All shops for user',
      data: await ShopService.getAllShopForUser()
    }).send(res)
  }

  getAllShops = async(req, res, next) => {
    return new SuccessReponse({
      message: 'All shops',
      data: await ShopService.getAllShop({
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        query: req.query
      })
    }).send(res)
  }

  getShopByOwnerId = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Shop by owner id',
      data: await ShopService.getShopByOwnerId(req.user._id)
    }).send(res)
  }

  getShopById = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Shop by id',
      data: await ShopService.getShop({
        id: req.params.id
      })
    }).send(res)
  }

  updateShopById = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Shop updated successfully',
      data: await ShopService.updateShop(req.params.id, req.body)
    }).send(res)
  }

  deleteShopById = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Shop deleted successfully',
      data: await ShopService.deleteShop(req.params.id)
    }).send(res)
  }

  updateShopLogo = async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new BadRequestError('File not found')
    }
    const shop = await shopModel.findOne({
      owner_id: req.user._id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found')
    }
    const result = await uploadService.uploadShopLogo({
      filePath: file.path,
      shopId: shop._id
    })
    shop.logo = result.secure_url
    await shop.save();
    
    new SuccessReponse({
      message: "Shop logo uploaded successfully",
      data: shop
    }).send(res)
  };

}

module.exports = new ShopController;