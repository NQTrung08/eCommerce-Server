'use strict';

const { NotFoundError, BadRequestError } = require('../core/error.response');
const productModel = require('../models/product.model');
const shopModel = require('../models/shop.model');
const categoryModel = require('../models/category.model');
const skuModel = require('../models/sku.model');
const reviewModel = require('../models/review.model');
const orderModel = require('../models/order.model');
const skuService = require('../services/sku.service');
const { uploadProductThumbnail } = require('../services/upload.service');
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');

const slugify = require('slugify');
const { handlePaginationAndSorting, mapProductWithCounts } = require('../models/repo/product.repo');
const catalogShopModel = require('../models/catalogShop.model');

/**
 * 1. Tạo sản phẩm (public hoặc draft)
 * 2. xóa sản phẩm (draft hoặc vĩnh viễn)
 * 3. liệt kê sản phẩm
 * 4. tìm kiếm sản phẩm
 * 5. lọc sản phẩm (ctime, brand, giá, đánh giá, danh mục)
 * 6. get products theo category, shop, brand, giá, đánh giá, danh mục của shop
 */

// Service tạo sản phẩm mới
const newProduct = async (owner_id, productData, files) => {
  // Truy vấn shopId từ owner_id
  const shop = await shopModel.findOne({ owner_id });
  if (!shop) {
    throw new NotFoundError('Shop not found for the owner');
  }

  // Kiểm tra xem danh mục sản phẩm có tồn tại không
  const category = await categoryModel.findById(productData.category_id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Kiểm tra xem sản phẩm có tồn tại không
  const existingProduct = await productModel.findOne({
    product_name: productData.product_name,
    shop_id: shop._id
  });
  if (existingProduct) {
    throw new BadRequestError('Product already exists in this shop');
  }

  // nếu có field là isDraft 
  if (productData.isDraft) {
    productData.isPublic = false;
  }

  // Upload các hình ảnh của sản phẩm
  const productImages = await uploadProductImages({
    files,
    shopId: shop._id,
    productId: productData.product_name, // Tạo productId tạm thời cho tên folder
  });

  // Gắn hình ảnh vào productData
  productData.product_img = productImages;

  // Lưu thông tin sản phẩm vào database
  return await productModel.create({
    ...productData,
    shop_id: shop._id,
  });
};


const uploadProductImages = async ({ files, shopId, productId }) => {
  const uploadedImages = [];

  for (const file of files) {
    const folder = `products/${shopId}/${productId}/images`;
    const publicId = `${productId}-${file.originalname.split('.')[0]}`;

    // Upload từng file lên Cloudinary
    const result = await uploadToCloudinary({ filePath: file.path, folder, publicId });

    uploadedImages.push(result.secure_url); // Lưu URL của ảnh đã upload
  }

  return uploadedImages;

};



const getRatingAndSoldCount = async (productId) => {
  const ratingCount = await reviewModel.countDocuments({ product_id: productId });

  const soldCount = await orderModel.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
  ]);

  const soldCountValue = soldCount[0]?.totalSold || 0;

  // Tính điểm đánh giá trung bình
  const avgRatingResult = await reviewModel.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const avgRating = avgRatingResult[0]?.avgRating || 0;

  return {
    ratingCount,
    soldCount: soldCountValue,
    avgRating
  };
}

const getAllProducts = async ({
  page = 1,
  limit = 24,
  sortBy = '-createdAt',
}) => {
  const { pageNumber, limitNumber, sortQuery, skip } = handlePaginationAndSorting(page, limit, sortBy);
  // Thực hiện truy vấn với phân trang, sắp xếp và chọn trường
  const products = await productModel.find({
    isPublic: true,
  })
    .populate({
      path: 'shop_id',
      select: 'shop_name -_id', // Chọn trường 'shop_name', loại bỏ '_id'
    })
    .populate({
      path: 'category_id',
      select: 'category_name -_id', // Chọn trường 'category_name', loại bỏ '_id'
    })
    .limit(limitNumber)
    .skip(skip)
    .sort(sortQuery)
    .lean();

  const totalCount = products.length;
  // Sử dụng Promise.all để đồng thời tính ratingCount và soldCount cho tất cả sản phẩm
  const productsWithCounts = await mapProductWithCounts(products);

  return {
    productsWithCounts,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNumber),
    currentPage: pageNumber,
  };

};



const getProductById = async (id) => {
  const product = await productModel.findOne({
    _id: id,
    isPublic: true,
  }).populate({
    path: 'shop_id',
    select: 'shop_name',
  })
    .populate({
      path: 'category_id',
      select: 'category_name',
    })
    .lean();

  if (!product) {
    throw new NotFoundError('Product not found');
  }
  const { ratingCount, soldCount, avgRating } = await getRatingAndSoldCount(product._id);

  return {
    ...product,
    ratingCount,
    soldCount,
    avgRating,
  };

}

const updateProduct = async ({ userId, id, body, files }) => {

  // Kiểm tra các trường bắt buộc nếu body có các trường liên quan

  const requiredFields = ['product_name', 'product_price', 'product_quantity', 'category_id'];

  for (const field of requiredFields) {
    if (field in body && !body[field]) {
      throw new BadRequestError(`Missing required field: ${field}`);
    }
  }

  // Tìm shop với owner_id để đảm bảo shop tồn tại
  const shop = await shopModel.findOne({ owner_id: userId });
  if (!shop) {
    throw new NotFoundError('Shop not found for the owner');
  }

  // Kiểm tra xem sản phẩm có tồn tại trong shop không
  const existingProduct = await productModel.findOne({
    _id: id,
    shop_id: shop._id
  });
  if (!existingProduct) {
    throw new NotFoundError('Product not found in this shop');
  }

  // Tạo lại product_slug nếu product_name có trong body
  if (body.product_name) {
    body.product_slug = slugify(body.product_name, { lower: true });
  }

  // Cập nhật trạng thái hiển thị nếu có visibility
  if (body.isPublic) {
    body.isPublic = true;
    body.isDraft = false;
    body.isDeleted = false;
  } else if (body.isDraft) {
    body.isPublic = false;
    body.isDraft = true;
    body.isDeleted = false;
  }

  let productToUpdate
  if (!!files) {
    const productImages = await uploadProductImages({
      files: files,
      shopId: shop._id,
      productId: id, // Tạo productId tạm thời cho tên folder
    });
    productToUpdate = await productModel.findByIdAndUpdate(id, { $set: { ...body, product_img: productImages } }, { new: true });
  } else {
    productToUpdate = await productModel.findByIdAndUpdate(id, { $set: body }, { new: true });
  }

  if (!productToUpdate) {
    throw new NotFoundError('Product not found');
  }

  return productToUpdate;
};


const moveTrashProducts = async (ids) => {
  const products = await productModel.updateMany(
    { _id: { $in: ids } }, // Tìm kiếm theo danh sách ID
    {
      isPublic: false,
      isDraft: false,
      isDeleted: true
    }
  );

  if (products.modifiedCount === 0) {
    throw new NotFoundError('No products found to delete');
  }

  return products;
}

const publicProducts = async (ids) => {
  const products = await productModel.updateMany(
    { _id: { $in: ids } }, // Tìm kiếm theo danh sách ID
    {
      isPublic: true,
      isDraft: false,
      isDeleted: false
    }
  );

  if (products.modifiedCount === 0) {
    throw new NotFoundError('No products found to publish');
  }

  return products;
}

const privateProducts = async (ids) => {
  const products = await productModel.updateMany(
    { _id: { $in: ids } }, // Tìm kiếm theo danh sách ID
    {
      isPublic: false,
      isDraft: true,
      isDeleted: false
    }
  );

  if (products.modifiedCount === 0) {
    throw new NotFoundError('No products found to make private');
  }

  return products;
}



const searchProducts = async ({
  searchQuery = '',
  category = '',  // Thêm trường category để lọc theo danh mục
  page = 1,
  limit = 20,
  sortBy = '-createdAt'
}) => {

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  // Xây dựng truy vấn tìm kiếm
  let query = {};

  // Nếu searchQuery không phải chuỗi rỗng, thực hiện tìm kiếm văn bản
  if (searchQuery.trim() !== '') {
    query.$text = {
      $search: searchQuery,
      $caseSensitive: false,
      $diacriticSensitive: false
    };
  }

  // Nếu có category, thêm điều kiện lọc theo category_id
  if (category) {
    query.category_id = category;
  }

  // Xử lý sắp xếp
  let sortQuery = {};

  if (sortBy === 'sold_count') {
    // Sắp xếp theo sản phẩm bán chạy nhất
    sortQuery = { sold_count: -1 };
  } else if (sortBy === 'price_asc') {
    // Sắp xếp theo giá tăng dần
    sortQuery = { price: 1 };
  } else if (sortBy === 'price_desc') {
    // Sắp xếp theo giá giảm dần
    sortQuery = { price: -1 };
  } else {
    // Mặc định sắp xếp theo mới nhất (createdAt)
    sortQuery = { createdAt: -1 };
  }

  // Tìm kiếm sản phẩm với phân trang, sắp xếp và chọn trường
  const products = await productModel.find(query)
    .populate({
      path: 'shop_id',
      select: 'shop_name shop_id', // Chọn trường 'shop_name', loại bỏ '_id'
    })
    .populate({
      path: 'category_id',
      select: 'category_name -_id', // Chọn trường 'category_name', loại bỏ '_id'
    })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .sort(sortQuery)
    .lean();

  // Sử dụng Promise.all để đồng thời tính ratingCount và soldCount cho tất cả sản phẩm
  const productsWithCounts = await Promise.all(products.map(async (product) => {
    const { ratingCount, soldCount, avgRating } = await getRatingAndSoldCount(product._id);
    return {
      ...product,
      ratingCount,
      soldCount,
      avgRating
    };
  }));

  // Lấy tổng số sản phẩm để tính tổng số trang
  const totalCount = await productModel.countDocuments(query);

  return {
    productsWithCounts,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNumber),
    currentPage: pageNumber
  };
};


// get products by shop id and category id
const getProductsByCatalogShop = async ({
  shopId, catalogId
}) => {
  const shopExists = await shopModel.exists({ _id: shopId });
  if (!shopExists) {
    throw new NotFoundError('Shop not found');
  }

  const catalogShop = await catalogShopModel.exists({ _id: catalogId });
  if (!catalogShop) {
    throw new NotFoundError('Catalog not found');
  }
  const products = await productModel.find({
    shop_id: shopId,
    catalog_id: catalogId,
    isPublic: true
  }).lean();

  return products;
}

const getProductsByShopId = async ({
  shopId,
  page = 1,
  limit = 20,
  sortBy = '-createdAt',
  filters = {}
}
) => {
  const { pageNumber, limitNumber, sortQuery, skip } = handlePaginationAndSorting(page, limit, sortBy);
  const shopExists = await shopModel.exists({ _id: shopId });
  if (!shopExists) {
    throw new NotFoundError('Shop not found');
  }
  // Query MongoDB
  const query = {
    shop_id: shopId,
    isPublic: true,
    ...filters,
  };
  const products = await productModel.find(query)
    .populate({
      path: 'category_id',
    })
    .lean();
  // Lấy tổng số sản phẩm để tính tổng số trang
  const totalCount = products.length;

  const productsWithCounts = await mapProductWithCounts(products);

  return {
    productsWithCounts,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNumber),
    currentPage: pageNumber,
  };
}

// add products in catalog of shop
const addProductsToCatalog = async ({
  shopId,
  catalogId,
  productIds
}) => {
  const shopExists = await shopModel.exists({ _id: shopId });
  if (!shopExists) {
    throw new NotFoundError('Shop not found');
  }

  const catalogShopExists = await catalogShopModel.exists({ _id: catalogId });
  if (!catalogShopExists) {
    throw new NotFoundError('Category not found');
  }

  const existingProducts = await productModel.find({ _id: { $in: productIds } });

  if (existingProducts.length !== productIds.length) {
    throw new BadRequestError('Some products not found in the shop');
  }

  // Cập nhật catalog_id cho các sản phẩm
  await productModel.updateMany(
    { _id: { $in: productIds } }, // Điều kiện để tìm sản phẩm
    { $set: { catalog_id: catalogId } } // Gán catalog_id mới cho sản phẩm
  );

  return {
    message: 'Products successfully added to catalog',
    catalogId,
    updatedProductsCount: productIds.length,
  };


}

const getProductsByCategoryId = async ({
  categoryId
}) => {
  const products = await productModel.find({
    category_id: categoryId,
    isPublic: true
  }).lean();
  return products;
}

const getCountProduct = async ({
  shopId
}) => {
  const countProduct = await productModel.aggregate([
    {
      $match: {
        shop_id: shopId, // Lọc sản phẩm theo shop_id
      },
    },
    {
      $group: {
        _id: null, // Không cần nhóm theo bất kỳ trường nào
        totalDraft: { $sum: { $cond: [{ $eq: ["$isDraft", true] }, 1, 0] } },
        totalPublic: { $sum: { $cond: [{ $eq: ["$isPublic", true] }, 1, 0] } },
        totalDeleted: { $sum: { $cond: [{ $eq: ["$isDeleted", true] }, 1, 0] } },
      },
    },
  ]);

  return countProduct.length > 0 ? countProduct[0] : { totalDraft: 0, totalPublic: 0, totalDeleted: 0 };
}

const deleteProducts = async (ids) => {
  const products = await productModel.deleteMany(
    { _id: { $in: ids } }, // Tìm kiếm theo danh sách ID

  );

  if (products.modifiedCount === 0) {
    throw new NotFoundError('No products found to delete');
  }

  return products;
}

module.exports = {
  newProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  moveTrashProducts,
  deleteProducts,
  searchProducts,
  uploadProductImages,
  publicProducts,
  privateProducts,
  getProductsByCatalogShop,
  getProductsByShopId,
  addProductsToCatalog,
  getProductsByCategoryId,
  getCountProduct
};
