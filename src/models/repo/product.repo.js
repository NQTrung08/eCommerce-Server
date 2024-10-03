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

const checkProductByServer = async (products) => {
  return await Promise.all(products.map(async (product) => {
    const foundProduct = await getProductById(product.productId);
    
    if (!foundProduct) {
      return null; // Sản phẩm không tồn tại
    }

    // Kiểm tra nếu số lượng sản phẩm trong kho ít hơn số lượng yêu cầu
    if (foundProduct.quantity < product.quantity) {
      return null; // Sản phẩm không đủ số lượng tồn kho
    }

    // Nếu sản phẩm hợp lệ, trả về thông tin sản phẩm
    return {
      productId: foundProduct._id,
      price: foundProduct.price,
      availableQuantity: foundProduct.quantity, // Số lượng tồn kho hiện có
      requestedQuantity: product.quantity,      // Số lượng khách hàng yêu cầu
    };
  }));
};


module.exports = {
  getProductById,
  checkProductByServer,
}