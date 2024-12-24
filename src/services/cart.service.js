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
  const { productId, quantity } = product;

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

const addToCart = async ({ userId, product }) => {
  const { productId, quantity } = product;
  if (!userId) {
    throw new BadRequestError('User id is required');
  }
  if (!productId || !quantity) {
    throw new BadRequestError('Product id and quantity are required');
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

  console.log('userCart', userCart)

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
  return await updateUserCartQuantity({ userId, product: { ...product, quantity: productInCart.quantity + product.quantity } });

};

const updateQuantityFromCart = async ({ userId, product }) => {
  const { productId, quantity } = product; // Chỉ cần lấy quantity mới

  // Kiểm tra giá trị quantity phải hợp lệ và lớn hơn hoặc bằng 0 và phải truyền vào là number
  if (typeof quantity !== 'number') {
    throw new BadRequestError('Quantity must be a number');
  }
  if (quantity < 0) {
    throw new BadRequestError('Quantity must be non-negative');
  }

  // Kiểm tra sản phẩm có tồn tại
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

  // Kiểm tra số lượng sản phẩm có sẵn trong kho
  const availableQuantity = foundProduct.product_quantity;
  if (quantity > availableQuantity) {
    throw new BadRequestError('Not enough stock available');
  }

  // Nếu số lượng = 0, xóa sản phẩm khỏi giỏ hàng
  if (quantity === 0) {
    return await removeFromCart({ userId, productId });
  }

  // Cập nhật số lượng sản phẩm trực tiếp trong giỏ hàng
  return await updateUserCartQuantity({
    userId,
    product: {
      productId,
      quantity, // Đặt số lượng mới
    },
  });
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product;

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

  // Cập nhật số lượng sản phẩm trong giỏ hàng thành giá trị mới
  const query = {
    cart_userId: userId,
    cart_state: 'active',
    'cart_products.productId': productId,
  };

  const updateSet = {
    $set: { 'cart_products.$.quantity': quantity }, // Đặt lại số lượng thành giá trị mới
  };

  const options = { new: true };

  return await cartModel.findOneAndUpdate(query, updateSet, options);
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
