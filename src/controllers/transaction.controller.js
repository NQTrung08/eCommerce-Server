const { SuccessReponse } = require("../core/success.response");
const {getTransactions} = require('../services/transaction.service')

class TransactionController {
  getTransactions = async (req, res, next) => {
    
    new SuccessReponse({
      message: "Transactions fetched successfully",
      data: await getTransactions(),
    }).send(res)
  }
}

module.exports = new TransactionController;