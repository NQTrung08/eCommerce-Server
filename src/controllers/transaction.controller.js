const { BadRequestError } = require("../core/error.response");
const { SuccessReponse } = require("../core/success.response");
const shopModel = require("../models/shop.model");
const {getTransactions} = require('../services/transaction.service')

class TransactionController {
  getTransactions = async (req, res, next) => {
    
    new SuccessReponse({
      message: "Transactions fetched successfully",
      data: await getTransactions(),
    }).send(res)
  }

  getTransactionsByShopId = async (req, res, next) => {
    const owner_id = req.user._id;
    const shop = await shopModel.findOne({
      owner_id,
    });
    if (!shop) {
      throw new BadRequestError("Shop not found");
    }
    new SuccessReponse({
      message: "Transactions fetched successfully",
      data: await getTransactions({ shopId: shop._id }),
    }).send(res)
  }
}

module.exports = new TransactionController;