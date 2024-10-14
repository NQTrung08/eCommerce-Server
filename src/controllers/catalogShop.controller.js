'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessReponse, CREATED } = require('../core/success.response');
const shopModel = require('../models/shop.model');
const CatalogShopService = require('../services/catelogOfShop.service')

class CatalogShopController {
  newCatalogShop = async (req, res, next) => {
    const { _id } = req.user;
    // find shop id by _id is owner
    const shop = await shopModel.findOne({
      owner_id: _id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    const { catalogName, catalogDescription } = req.body
    const catalogShop = await CatalogShopService.createShopCategory({
      shopId: shop._id,
      catalogName,
      catalogDescription
    })
    new CREATED({
      message: 'Catalog shop created successfully',
      data: catalogShop
    }).send(res)
  }

  getCatalogShop = async (req, res, next) => {
    const { shopId } = req.params;
    if (!shopId) {
      throw new BadRequestError('ShopId not found for the owner');
    }
    const catalogShop = await CatalogShopService.getShopCategories({
      shopId
    })
    new SuccessReponse({
      message: 'Get catalog shop successfully',
      data: catalogShop
    }).send(res)
  }

  updateCatalogShop = async (req, res, next) => {
    const { _id } = req.user;
    const { catalogId } = req.params
    const { catalogName, catalogDescription } = req.body
    // find shop id by _id is owner
    const shop = await shopModel.findOne({
      owner_id: _id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    const catalogShop = await CatalogShopService.updateCatalogShop({
      shopId: shop._id,
      catalogId,
      catalogName,
      catalogDescription
    })
    new SuccessReponse({
      message: 'Update catalog shop successfully',
      data: catalogShop
    }).send(res)
  }

  deleteCatalogShop = async (req, res, next) => {
    const { _id } = req.user;
    const { catalogId } = req.params
    // find shop id by _id is owner
    const shop = await shopModel.findOne({
      owner_id: _id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }
    const catalogShop = await CatalogShopService.deleteCatalogShop({
      shopId: shop._id,
      catalogId
    })
    new SuccessReponse({
      message: 'Delete catalog shop successfully',
      data: catalogShop
    }).send(res)
  }
}

module.exports = new CatalogShopController();