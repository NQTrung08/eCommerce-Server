const { BadRequestError } = require("../core/error.response")
const productModel = require("../models/product.model")
const reviewModel = require("../models/review.model")
const shopModel = require("../models/shop.model")
const userModel = require("../models/user.model")

const createReview = async (payload) => {
  const {
    productId,
    userId,
    rating,
    comment
  } = payload
  // TODO: handle product and user existence
  const user = await userModel.findById(userId)
  const product = await productModel.findOne(
    {
      _id: productId,
      isPublic: true,
    })
  if (!user || !product) {
    throw new BadRequestError("User or product not found")
  }
  // Create a new review
  const review = await reviewModel.create({
    product_id: productId,
    user_id: userId,
    rating: rating,
    comment: comment
  })
  return review
}

const getReviewsByProductId = async (productId) => {
  // TODO: handle product existence
  const product = await productModel.findById(productId)
  if (!product) {
    throw new BadRequestError("Product not found")
  }
  const review = await reviewModel.find({ product_id: productId })
    .populate('product_id')
    .populate('user_id')
  return review
}


const getAllReviewsForShop = async ({ shopId }) => {
  const shop = await shopModel.findById(shopId)
  if (!shop) {
    throw new BadRequestError("Shop not found")
  }
  const products = await productModel.find({
    shop_id: shopId
  })
  if (!products) {
    throw new BadRequestError("Product not found")
  }
  // Lấy danh sách các product_id
  const productIds = products.map(product => product._id);

  // Tìm các đánh giá có product_id nằm trong danh sách productIds
  const reviews = await reviewModel
    .find({ product_id: { $in: productIds } })
    .populate('product_id') // Populate để lấy chi tiết sản phẩm
    .populate('user_id');   // Populate để lấy chi tiết người dùng

  return reviews;
}

const getAll = async () => {
  const reviews = await reviewModel.find({})
    .populate('product_id')
    .populate('user_id')
  return reviews
}

module.exports = {
  createReview,
  getReviewsByProductId,
  getAllReviewsForShop,
  getAll
}