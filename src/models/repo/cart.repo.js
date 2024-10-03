const cartModel = require('../cart.model')
const { convertToObjectId } = require('../../utils');

const findCartById = async () => {
  return await cartModel.findOne({
    _id: convertToObjectId(cartId),
    cart_state: 'active'
  })
}

module.exports = {
  findCartById,
}