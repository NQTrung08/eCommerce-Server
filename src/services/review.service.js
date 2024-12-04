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
  return review
}


const getAllReviewsForShop = async ({ shopId }) => {
  const shop = await shopModel.findById(shopId)
  if (!shop) {
    throw new BadRequestError("Shop not found")
  }
  const reviews = await reviewModel.find({ shop_id: shop.id })
  return reviews
}

const getAll = async () => {
  const reviews = await reviewModel.find({})
  return reviews
}

module.exports = {
  createReview,
  getReviewsByProductId,
  getAllReviewsForShop,
  getAll
}