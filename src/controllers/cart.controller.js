

const { SuccessReponse } = require('../core/success.response');
const CartService = require('../services/cart.service')

class CartController {
  addToCart = async (req, res, next) => {
    const { _id } = req.user;
    const product = req.body; // id product va quantity can them vao gio hang
    const cart = await CartService.addToCart({ userId: _id, product })
    new SuccessReponse({
      message: 'Product added to cart',
      data: cart
    }).send(res);
  }

  // update + -
  updateQuantityFromCart = async (req, res, next) => {
    const { userId} = req.user;
    const { shop_order_ids } = req.body; // id product va quantity can update
    const cart = await CartService.updateQuantityFromCart({ userId, shop_order_ids })
    new SuccessReponse({
      message: 'Quantity updated in cart',
      data: cart
    }).send(res);
  }

  // delete product
  removeFromCart = async (req, res, next) => {
    const { userId } = req.user;
    const { productId } = req.params; // id product can xoa 1 san pham trong gio hang
    const cart = await CartService.removeFromCart({ userId, productId })
    new SuccessReponse({
      message: 'Product removed from cart',
      data: cart
    }).send(res);
  }

  // delete products
  removeProductsFromCart = async (req, res, next) => {
    const { userId } = req.user;
    const { productIds } = req.body; // id product can xoa nhieu san pham trong gio hang
    const cart = await CartService.removeProductsFromCart({ userId, productIds })
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