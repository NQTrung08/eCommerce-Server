const { BadRequestError } = require("../core/error.response");
const { SuccessReponse } = require("../core/success.response");
const orderModel = require("../models/order.model");
const { createReview, getReviewsByProductId } = require("../services/review.service");


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
}

module.exports = new ReviewController;