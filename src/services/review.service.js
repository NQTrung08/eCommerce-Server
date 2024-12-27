const { BadRequestError } = require("../core/error.response")
const productModel = require("../models/product.model")
const reviewModel = require("../models/review.model")
const shopModel = require("../models/shop.model")
const userModel = require("../models/user.model")
const mongoose = require('mongoose');

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

const getCountReview = async (type, id) => {
  switch (type) {
    case "admin":
      return getStarCountByAdmin()
    case "shop":
      return getStarCountsByShop(id)
    case "product":
      return getStarCountsByProduct(id)
  }
}

const getStarCountsByProduct = async (productId) => {
  
  if(!Array.isArray(productId)) {
    productId = [productId]
  }
  const objectIds = productId.map((id) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    throw new BadRequestError(`Invalid productId: ${id}`);
  });

  const starCounts = await reviewModel.aggregate([
    { $match: { product_id: { $in: objectIds } } }, // Lọc theo `product_id`
    {
      $group: {
        _id: "$rating", // Nhóm theo trường `rating` (1, 2, 3, 4, 5 sao)
        count: { $sum: 1 }, // Đếm số lượng đánh giá cho từng nhóm
      },
    },
    {
      $project: {
        _id: 0, // Loại bỏ `_id` khỏi kết quả
        rating: "$_id", // Gán `_id` vào `rating`
        count: 1, // Giữ lại trường `count`
      },
    },
    { $sort: { rating: 1 } }, // Sắp xếp theo `rating` tăng dần
  ]);

  // Đảm bảo trả về đủ các số sao từ 1 đến 5 (nếu không có thì gán `count = 0`)
  const ratings = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: 0,
  }));

  starCounts.forEach((star) => {
    ratings[star.rating - 1].count = star.count;
  });

  return ratings;
};

const getStarCountsByShop = async (shopId) => {
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
  // Đếm các sao của tất cả sản phẩm trong shop
  const rating = getStarCountsByProduct(productIds)
  return rating;
  
};

const getStarCountByAdmin = async () => {
  const products = await productModel.find({})
  const productIds = products.map(product => product._id);
  const rating = getStarCountsByProduct(productIds)
  return rating;
}

module.exports = {
  createReview,
  getReviewsByProductId,
  getAllReviewsForShop,
  getAll,
  getCountReview
}