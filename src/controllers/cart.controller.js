

const { SuccessReponse } = require('../core/success.response');
const CartService = require('../services/cart.service')

class CartController {
  addToCart = async (req, res, next) => {
    const { _id } = req.user;
    const cart = await CartService.addToCart({ userId: _id, product: req.body })
    new SuccessReponse({
      message: 'Product added to cart',
      data: cart
    }).send(res);
  }

  // update + -
  updateQuantityFromCart = async (req, res, next) => {
    const { _id } = req.user;
    const cart = await CartService.updateQuantityFromCart({ userId: _id, product: req.body })
    new SuccessReponse({
      message: 'Quantity updated in cart',
      data: cart
    }).send(res);
  }

  // delete product
  removeFromCart = async (req, res, next) => {
    const { _id } = req.user;
    const cart = await CartService.removeFromCart({
      userId: _id,
      productId: req.params.productId,
    })
    new SuccessReponse({
      message: 'Product removed from cart',
      data: cart
    }).send(res);
  }

  // delete products
  removeProductsFromCart = async (req, res, next) => {
    const { _id } = req.user;
    console.log("body", req.body)
    const cart = await CartService.removeProductsFromCart({ userId: _id, productIds: req.body })
    new SuccessReponse({
      message: 'Products removed from cart',
      data: cart
    }).send(res);
  }

  // get cart
  getCart = async (req, res, next) => {
    const { _id } = req.user;
    const cart = await CartService.getListCart({ userId: _id })
    new SuccessReponse({
      message: 'List product in cart',
      data: cart
    }).send(res);
  }


}

module.exports = new CartController();