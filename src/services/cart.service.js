'use strict';
const { NotFoundError, BadRequestError } = require('../core/error.response');
const cartModel = require('../models/cart.model');
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
  const { productId, quantity} = product;
  
  if (!userId || !productId || !quantity) {
    throw new BadRequestError('User id, product id, quantity are required');
  }

  // Kiểm tra sản phẩm có tồn tại
  const productExist = await getProductById(productId);
  if (!productExist) {
    throw new NotFoundError('Product not found');
  }
  const newProduct = {
    productId,
    shopId: productExist.shop_id,
    quantity: quantity,
    price: productExist.product_price,
    product_name: productExist.product_name,
    product_desc: productExist.product_desc,
  };

  const query = { cart_userId: userId, cart_state: 'active' };
  const updateOrInsert = {
    $addToSet: {
      cart_products: newProduct,
    },
  };
  const options = { upsert: true, new: true };

  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product;

  if (!userId || !productId || quantity <= 0) {
    throw new BadRequestError('User id, product id, and quantity are required');
  }

  // Kiểm tra sản phẩm có tồn tại
  const productExist = await getProductById(productId);
  if (!productExist) {
    throw new NotFoundError('Product not found');
  }

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const userCart = await cartModel.findOne({
    cart_userId: userId,
    cart_state: 'active',
    'cart_products.productId': productId,
  });

  if (!userCart) {
    throw new NotFoundError('Product not found in cart');
  }

  const currentProduct = userCart.cart_products.find(p => p.productId.toString() === productId.toString());
  
  // Kiểm tra số lượng yêu cầu có lớn hơn số lượng trong kho không
  if (currentProduct.quantity + quantity > productExist.product_quantity) {
    throw new BadRequestError('Not enough stock available');
  }

  const query = {
    cart_userId: userId,
    cart_state: 'active',
    'cart_products.productId': productId,
  };

  const updateSet = {
    $inc: { 'cart_products.$.quantity': quantity },
  };

  const options = { new: true };

  return await cartModel.findOneAndUpdate(query, updateSet, options);
};


const addToCart = async ({ userId, product }) => {
  const { productId, quantity } = product;

  // Kiểm tra thông tin đầu vào
  if (!userId || !productId || !quantity) {
    throw new BadRequestError('User id, product id, quantity are required');
  }

  // Kiểm tra sản phẩm có tồn tại
  const productExist = await getProductById(productId);
  if (!productExist) {
    throw new NotFoundError('Product not found');
  }

  // Kiểm tra sản phẩm có công khai và còn trong kho
  if (!productExist.isPublic) {
    throw new BadRequestError('Product is not available for sale');
  }

  if (productExist.stock_status !== 'inStock' && productExist.stock_status !== 'preOrder') {
    throw new BadRequestError('Product is out of stock');
  }

  // Kiểm tra số lượng sản phẩm trong kho
  if (quantity > productExist.product_quantity) {
    throw new BadRequestError('Not enough stock available');
  }

  // Kiểm tra giỏ hàng của người dùng
  const userCart = await cartModel.findOne({
    cart_userId: userId,
    cart_state: 'active', // Chỉ giỏ hàng đang hoạt động
  });


  if (!userCart) {
    return await createUserCart({ userId, product });
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const productInCart = userCart.cart_products.find(
    (p) => p.productId.toString() === productId.toString()
  );

  if (!productInCart) {
    // Thêm sản phẩm mới vào giỏ hàng nếu chưa tồn tại
    const newProduct = {
      productId,
      shopId: productExist.shop_id,
      quantity,
      price: productExist.product_price,
      product_name: productExist.product_name,
      product_desc: productExist.product_desc,
    };
    
    userCart.cart_products.push(newProduct);
    return await userCart.save();
  }

  // Nếu sản phẩm đã tồn tại, cập nhật số lượng
  return await updateUserCartQuantity({ userId, product });

};

const updateQuantityFromCart = async ({ userId, product }) => {
  const { productId, quantity, old_quantity } = product;

  // Kiểm tra sản phẩm tồn tại
  const foundProduct = await productModel.findById(productId);
  if (!foundProduct) {
    throw new NotFoundError('Product not found');
  }

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const userCart = await cartModel.findOne({
    cart_userId: userId,
    cart_state: 'active',
    'cart_products.productId': productId,
  });

  if (!userCart) {
    throw new NotFoundError('Product not found in cart');
  }

  // Tính toán số lượng cần cập nhật
  const newQuantity = quantity - old_quantity;

  // Kiểm tra số lượng sản phẩm có trong kho
  const availableQuantity = foundProduct.product_quantity;

  // Đảm bảo số lượng cập nhật không vượt quá số lượng có sẵn
  if (newQuantity > availableQuantity) {
    throw new BadRequestError('Not enough stock available');
  }

  if (quantity === 0) {
    return await removeFromCart({
      userId,
      productId,
    });
  }

  return updateUserCartQuantity({
    userId,
    product: {
      productId,
      quantity: newQuantity,
    },
  });
};


const removeFromCart = async ({ userId, productId }) => {
  const userCart = await cartModel.findOneAndUpdate(
    {
      cart_userId: userId,
      cart_state: 'active',
    },
    { $pull: { cart_products: { productId } } },
    { new: true }
  );
  return userCart;
};

const removeProductsFromCart = async ({ userId, productIds }) => {
  const ids = productIds;

  if (!userId || !ids.length) {
    throw new BadRequestError('User id and product ids are required');
  }

  const userCart = await cartModel.findOneAndUpdate(
    { cart_userId: userId },
    {
      $pull: {
        cart_products: {
          productId: { $in: ids },
        },
      },
    },
    { new: true }
  );

  return userCart;
};

const getListCart = async ({ userId }) => {
  if (!userId) {
    throw new BadRequestError('User id is required');
  }

  return await cartModel.findOne({ cart_userId: userId }).lean();
};

module.exports = {
  createUserCart,
  addToCart,
  updateQuantityFromCart,
  removeFromCart,
  removeProductsFromCart,
  getListCart,
  updateUserCartQuantity,
};
