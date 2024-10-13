const { convertToObjectId } = require("../../utils");
const orderModel = require("../order.model");
const productModel = require("../product.model");
const reviewModel = require("../review.model");

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

// Hàm xử lý phân trang và sắp xếp
const handlePaginationAndSorting = (page = 1, limit = 10, sortBy = '-createdAt') => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  let sortQuery;
  if (sortBy === 'sold_count') {
    sortQuery = { soldCount: -1 };
  } else {
    sortQuery = { [sortBy]: 1 };
  }

  const skip = (pageNumber - 1) * limitNumber;

  return { pageNumber, limitNumber, sortQuery, skip };
};

// Hàm lấy thông tin ratingCount, soldCount và avgRating cho sản phẩm
const getRatingAndSoldCount = async (productId) => {
  const ratingCount = await reviewModel.countDocuments({ product_id: productId });

  const soldCount = await orderModel.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: null, totalSold: { $sum: '$quantity' } } },
  ]);

  const soldCountValue = soldCount[0]?.totalSold || 0;

  const avgRatingResult = await reviewModel.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);

  const avgRating = avgRatingResult[0]?.avgRating || 0;

  return {
    ratingCount,
    soldCount: soldCountValue,
    avgRating,
  };
};

// Hàm gắn ratingCount và soldCount vào danh sách sản phẩm
const mapProductWithCounts = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const { ratingCount, soldCount, avgRating } = await getRatingAndSoldCount(product._id);
      return {
        ...product,
        ratingCount,
        soldCount,
        avgRating,
      };
    })
  );
};


module.exports = {
  getProductById,
  checkProductByServer,
  handlePaginationAndSorting,
  mapProductWithCounts,
  getRatingAndSoldCount,
}