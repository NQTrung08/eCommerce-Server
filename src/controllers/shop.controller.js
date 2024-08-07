
const { CREATED, SuccessReponse } = require('../core/success.response');
const ShopService = require('../services/shop.service');



class ShopController {
  newShop = async(req, res, next) => {
    return new CREATED({
      message: 'Shop created successfully',
      data: await ShopService.newShop({
        owner_id: req.user._id,
        body: req.body,
      })
    }).send(res)
  }

  getAllShops = async(req, res, next) => {
    return new SuccessReponse({
      message: 'All shops',
      data: await ShopService.getAllShop()
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
      data: await ShopService.getShop(req.params.id)
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

}

module.exports = new ShopController;