
/**
 * 1. generator discount code [ shop | admin]
 * 2. get all discount codes [ user | shop | admin]
 * 3. get all product by discount code
 * 4. get discount amount
 * 5. delete discount code [ shop | admin]
 * 6. cancel discount code
 */

const { BadRequestError } = require("../core/error.response")
const discountModel = require("../models/discount.model")
const productModel = require("../models/product.model")
const { convertToObjectId } = require("../utils")

const createDiscountCode = async (payload) => {
  const {
    shopId,
    name,
    code,
    description,
    type,
    value,
    min_order_value,
    applies_to,
    product_ids,
    max_uses,
    max_uses_per_user,
    startDate,
    endDate,
    status,
  } = payload

  if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
    throw new BadRequestError('Discount code has expired')
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new BadRequestError('Start date cannot be after end date')
  }

  // create index for discount code
  const foundDiscount = await discountModel.findOne({
    discount_code: code,
    discount_shopId: convertToObjectId(shopId),
  })

  if (foundDiscount && foundDiscount.discount.status === 'active') {
    throw new BadRequestError('Discount code already exists')
  }

  const newDiscount = await discountModel.create({
    discount_shopId: convertToObjectId(shopId),
    discount_code: code,
    discount_name: name,
    discount_des: description,
    discount_type: type,
    discount_value: value,
    discount_startDate: new Date(startDate),
    discount_endDate: new Date(endDate),
    discount_max_uses: max_uses,
    discount_max_uses_per_user: max_uses_per_user,
    discount_min_order_value: min_order_value,
    discount_status: status,
    discount_applies_to: applies_to,
    discount_product_ids: applies_to === 'all_products' ? [] : product_ids,


  })

  return newDiscount

}

// update discount
const updateDiscountCode = async (shopId, code, payload) => {
  const {
    name,
    description,
    type,
    value,
    min_order_value,
    applies_to,
    product_ids,
    max_uses,
    max_uses_per_user,
    startDate,
    endDate,
    status,
  } = payload

  if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
    throw new BadRequestError('Discount code has expired')
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new BadRequestError('Start date cannot be after end date')
  }

  const updatedDiscount = await discountModel.findOneAndUpdate(
    {
      discount_shopId: convertToObjectId(shopId),
      discount_code: code,
    },
    {
      $set: {
        discount_name: name,
        discount_des: description,
        discount_type: type,
        discount_value: value,
        discount_startDate: new Date(startDate),
        discount_endDate: new Date(endDate),
        discount_max_uses: max_uses,
        discount_max_uses_per_user: max_uses_per_user,
        discount_min_order_value: min_order_value,
        discount_status: status,
        discount_applies_to: applies_to,
        discount_product_ids: applies_to === 'all_products' ? [] : product_ids,
      },
      new: true,
    }
  )

  if (!updatedDiscount) {
    throw new BadRequestError('Discount code not found')
  }
  return updatedDiscount
}

const getAllDiscountCodes = async (shopId) => {
  const discounts = await discountModel.find({
    discount_shopId: convertToObjectId(shopId),
  })

  return discounts
}

const getDiscountByCode = async (shopId, code) => {
  const discount = await discountModel.findOne({
    discount_shopId: convertToObjectId(shopId),
    discount_code: code,
  })

  return discount
}

const getAllProductByDiscountCode = async (shopId, code) => {
  const discount = await discountModel.findOne({
    discount_shopId: convertToObjectId(shopId),
    discount_code: code,
  })

  if (!discount) {
    throw new BadRequestError('Discount code not found')
  }
  let products;
  if (discount.discount_applies_to === 'all_products') {
    products = await productModel.find({
      shop_id: convertToObjectId(shopId),
      isPublic: true,
    })
  } else {
    products = await productModel.find({
      _id: { $in: discount.discount_product_ids },
    })
  }

  return products
}

// Thêm kiểm tra và cập nhật số lần sử dụng mã giảm giá
const getDiscountAmount = async (shopId, code, userId, orderValue) => {
  const discount = await discountModel.findOne({
    discount_shopId: convertToObjectId(shopId),
    discount_code: code,
  })

  if (!discount) {
    throw new BadRequestError('Discount code not found')
  }

  // Kiểm tra giá trị đơn hàng tối thiểu
  if (orderValue < discount.discount_min_order_value) {
    throw new BadRequestError('Order value does not meet the minimum requirement for this discount code');
  }

  // Kiểm tra nếu mã đã hết lượt sử dụng tổng cộng
  if (discount.discount_used >= discount.discount_max_uses) {
    throw new BadRequestError('Discount code has reached the maximum number of uses');
  }

  // Kiểm tra nếu user đã sử dụng mã vượt quá giới hạn cho mỗi user
  const userUses = discount.discount_users_used.filter(user => user === userId).length;
  if (userUses >= discount.discount_max_uses_per_user) {
    throw new BadRequestError('You have reached the maximum usage for this discount code');
  }


  let discountAmount = 0
  if (discount.discount_type === 'percentage') {
    discountAmount = discount.discount_value / 100 * discount.discount_min_order_value
  } else {
    discountAmount = discount.discount_value
  }

  // Cập nhật số lần mã giảm giá đã được sử dụng
  await discountModel.updateOne(
    { _id: discount._id },
    {
      $inc: { discount_used: 1 },
      $push: { discount_users_used: userId },
    }
  );


  return discountAmount
}

// hoàn tác khi hủy mã giảm giá
const rollbackDiscountUsage = async (shopId, code, userId) => {
  const discount = await discountModel.findOne({
    discount_shopId: convertToObjectId(shopId),
    discount_code: code,
  });

  if (!discount) {
    throw new BadRequestError('Discount code not found');
  }

  // Kiểm tra xem user có thực sự sử dụng mã giảm giá không
  const userIndex = discount.discount_users_used.indexOf(userId);
  if (userIndex === -1) {
    throw new BadRequestError('Discount code was not used by this user');
  }

  // Giảm số lần sử dụng và xóa user khỏi danh sách đã dùng mã
  discount.discount_used = discount.discount_used > 0 ? discount.discount_used - 1 : 0;
  discount.discount_users_used.splice(userIndex, 1); // Xóa user khỏi danh sách đã sử dụng

  await discount.save();

  return {
    message: 'Discount code usage has been rolled back successfully',
    discount,
  };
};




const deleteDiscountCode = async (shopId, code) => {
  const discount = await discountModel.findOneAndUpdate(
    {
      discount_shopId: convertToObjectId(shopId),
      discount_code: code,
    },
    {
      discount_status: 'inactive',
    },
    { new: true }
  )

  if (!discount) {
    throw new BadRequestError('Discount code not found')
  }

  return discount
}

const cancelDiscountCode = async (shopId, code) => {
  const discount = await discountModel.findOneAndUpdate(
    {
      discount_shopId: convertToObjectId(shopId),
      discount_code: code,
    },
    {
      discount_status: 'active',
    },
    { new: true }
  )

  if (!discount) {
    throw new BadRequestError('Discount code not found')
  }

  return discount
}

module.exports = {
  createDiscountCode,
  updateDiscountCode,
  getAllDiscountCodes,
  getDiscountByCode,
  deleteDiscountCode,
  cancelDiscountCode,
  getAllProductByDiscountCode,
  getDiscountAmount,
}