const { BadRequestError } = require("../core/error.response");
const { SuccessReponse } = require("../core/success.response");
const orderModel = require("../models/order.model");
const shopModel = require("../models/shop.model");
const { createReview, getReviewsByProductId, getAll, getAllReviewsForShop, getCountReview } = require("../services/review.service");


class ReviewController {
  createReview = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { productId, rating, comment } = req.body;

    // TODO: handle user already order
    const order = await orderModel.findOne({ order_userId: userId, order_status: 'completed' });
    if (!order) {
      throw new BadRequestError("User does not have any completed order");
    }
    const review = await createReview({
      productId,
      userId,
      rating,
      comment
    });
    new SuccessReponse({
      message: 'Review created successfully',
      data: review
    }).send(res);
  }

  // TODO: implement get review by product id
  getReviewsByProductId = async (req, res, next) => {
    const review = await getReviewsByProductId(req.params.productId);
    new SuccessReponse({
      message: 'Review by product id',
      data: review
    }).send(res);
  }

  getAll = async (req, res, next) => {
    new SuccessReponse({
      message: 'All reviews',
      data: await getAll()
    }).send(res);
  }

  getAllReviewsForShop = async (req, res, next) => {
    const id = req.user._id
    const shop = await shopModel.findOne({
      owner_id: id
    })
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    new SuccessReponse({
      message: 'All reviews for shop',
      data: await getAllReviewsForShop({
        shopId: shop._id
      })
    }).send(res);
  }

  getAllReviewsForShopId = async (req, res, next) => {
    const id = req.params.shopId
    const shop = await shopModel.findById(id)
    if (!shop) {
      throw new BadRequestError('Shop not found for the owner');
    }

    new SuccessReponse({
      message: 'All reviews for shop',
      data: await getAllReviewsForShop({
        shopId: shop._id
      })
    }).send(res);
  }

  getCountReview = async (req, res, next) => {
    const { type, id } = req.body
    new SuccessReponse({
      message: 'Get count review',
      data: await getCountReview(type, id)
    }).send(res);
  }
}


module.exports = new ReviewController;