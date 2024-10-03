'use strict'

const { NotFoundError } = require("../core/error.response")
const { findCartById } = require("../models/repo/cart.repo")
const { checkProductByServer } = require("../models/repo/product.repo")
const { getDiscountByCode } = require("./discount.service")

/**
 * {
 *  userId,
 * `cartId,
 *  shop_order_ids [
 *     {
 *        shopId,
 *        shop_discount: [
 *          {
 *               shopId,
 *               discountId,
 *               codeId
 *            },
 *        ],
 *        item_products: [
 *           {
 *               price,
 *               quantity,
 *               productId
 *            }
 *        ],
 * 
 *      }
 *   
 *  ],
 *  
 * }
 */

const checkoutReview = async({
  userId,
  cartId,
  shop_order_ids,
}) => {
  const foundCart = await findCartById(cartId)
  if (!foundCart) {
    throw new NotFoundError("Cart not found")
  }

  const checkout_order = {
    totalPrice: 0,
    feeShip: 0,
    totalDiscount: 0,
    totalCheckout: 0 // tong thanh toan
  }
  const shop_order_ids_new = [];
  // tinh tong tien bill
  for (let i = 0; i < shop_order_ids.length; i++) {
    const {
      shopId,
      shop_discount,
      item_products,
    } = shop_order_ids[i]
    // Kiểm tra sản phẩm và số lượng từ server
    const checkedProducts = await checkProductByServer(item_products);
    const invalidProducts = checkedProducts.filter(product => product === null);

    if (invalidProducts.length > 0) {
      throw new NotFoundError("Some products are invalid or out of stock");
    }

    // Tính tổng tiền đơn hàng
    const checkoutPrice = checkedProducts.reduce((acc, product) => {
      return acc + (product.price * product.requestedQuantity)
    },0)

    // Tổng trước khi xu ly
    checkout_order.totalPrice += checkoutPrice
    
    const itemCheckout = {
      shopId,
      shop_discount,
      priceRaw: checkoutPrice,
      priceApplyDiscount: checkoutPrice,
      item_products: checkedProducts,
    }

    // discount > 0, check exist
    if (shop_discount && shop_discount.length > 0) {
      for (let j = 0; j < shop_discount.length; j++) {
        const { shopId, discountId, codeId } = shop_discount[j]
        const discount = await getDiscountAmount(shopId, code)
        if (discount) {
          itemCheckout.priceApplyDiscount -= (itemCheckout.priceRaw * discount.discount_value) / 100
        }
      }
      
    }

    

   

  }

}

module.exports = {
  checkoutReview,
}