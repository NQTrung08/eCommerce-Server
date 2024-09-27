
'use strict';
const { NotFoundError, BadRequestError } = require('../core/error.response');
const cartModel = require('../models/cart.model')
const productModel = require('../models/product.model');
const { getProductById } = require('../models/repo/product.repo');
/**
 Key features: Cart
 * - Add product to cart [user]
 * - Remove product from cart [user]
 * - remove products from cart [user]
 * - reduce product
 * - increase product
 * - get cart
 * - delete cart
 */

const createUserCart = async ({ userId, product }) => {
  if(!userId ||!product.productId ||!product.quantity) {
    throw new BadRequestError('User id, product id and quantity are required')
  }
  // check product exists
  const productExist = getProductById(productId)
  if(!productExist) {
    throw new NotFoundError('Product not found')
  }
  const query = { cart_userId: userId, cart_state: 'active'}
  const updateOrInsert = {
    $addToSet: {
      cart_products: product
    }
  }
  const options = { upsert: true, new: true }
  return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
}

const updateUserCartQuantity = async({userId, product}) => { 
  const { productId, quantity } = product;
  if(!userId ||!productId || quantity <= 0) {
    throw new BadRequestError('User id, product id and quantity are required')
  }
  console.log("productid", productId)
  // check product exists
  const productExist = await getProductById(productId)
  if(!productExist) {
    throw new NotFoundError('Product not found')
  }
  const query = {
    cart_userId: userId,
    cart_state: 'active',
    'cart_products.productId': productId,
  }
  const updateSet = {
    $inc: { 'cart_products.$.quantity': quantity },
  }
  const options = {upsert: true, new: true}
 
  return await cartModel.findOneAndUpdate(query, updateSet, options)
}

const addToCart = async({userId, product}) => {
  if(!userId) {
    throw new BadRequestError('User id is required')
  }
  const userCart = await cartModel.findOne({
    cart_userId: userId,
  })
  
  if (!userCart) {
    const cart = await createUserCart({ userId, product })
    return cart
  }
  // co gio hang nhung chua co san pham
  if (!userCart.cart_products.length) {
    userCart.cart_products = [product]
    return await userCart.save()
  }

  // co san pham roi va them tiep quantity
  return await updateUserCartQuantity({userId, product})

  
}

// update product quantity from cart
/**
  
    {
        shopId,
        item_products: [
            {
                quantity,
                price,
                shopId,
                old_quantity,
                quantity
            }
        ],
        version
    }
  
 */

const updateQuantityFromCart = async({userId, product}) => {
  const { productId, quantity, old_quantity } = product;

  // check product
  const foundProduct = await productModel.findById(productId)
  if (!foundProduct) {
    throw new NotFoundError('Product not found')
  }
  if (foundProduct.shop_id.toString() !== product.shopId) {
    throw new NotFoundError('Product not belong to shop')
  }
  if (quantity == 0) {
    return await removeFromCart({
      userId,
      productId,
    })
  }

  return updateUserCartQuantity({
    userId,
    product: {
      productId,
      quantity: quantity - old_quantity,
    },
  })

}


const removeFromCart = async ({userId, productId}) => {
  const userCart = await cartModel.findOneAndUpdate(
    { cart_userId: userId,
      cart_state: 'active',
     },
    { $pull: { cart_products: { productId } } },
    { new: true }
  )
  return userCart
}

const removeProductsFromCart = async ({userId, productIds}) => {
  const userCart = await cartModel.findOneAndUpdate(
    { cart_userId: userId },
    { $pullAll: { cart_products: {
      productId: { $in: productIds.map(product => product._id) },
    } } },
    { new: true }
  )
  return userCart
}


const getListCart = async ({userId}) => {
  if (!userId) {
    throw new BadRequestError('User id is required')
  }
  return await cartModel.findOne({ cart_userId: userId }).lean()
}




module.exports = {
  createUserCart,
  addToCart,
  updateQuantityFromCart,
  removeFromCart,
  removeProductsFromCart,
  getListCart,
  updateUserCartQuantity,

}