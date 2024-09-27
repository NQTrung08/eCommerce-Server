const { convertToObjectId } = require("../../utils")
const productModel = require("../product.model")

const getProductById = async(productId) => {
  const id = convertToObjectId(productId)
  const product = await productModel.findOne({
    _id: id,
  }).lean();

  // Nếu không tìm thấy sản phẩm, trả về null
  if (!product) {
    return null;
  }
  return product;
}

module.exports = {
  getProductById,
}