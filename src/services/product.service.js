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
    // Kiểm tra các giá trị đầu vào để đảm bảo chúng không phải là undefined
    const pageNumber = Number.isInteger(page) ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(limit) ? parseInt(limit, 10) : 10;

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
      .skip((pageNumber - 1) * limitNumber)
      .sort(sortBy)
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
    const totalCount = products.length;

    return {
      productsWithCounts,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    };
  
};



const getProductById = async (id) => {
  try {
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
  } catch (error) {
    console.error('[E]::getProductById::', error);
    throw error;
  }
}

const updateProduct = async ({
  userId, id, body
}) => {

  // Kiểm tra các trường bắt buộc trong body
  const requiredFields = ['product_name', 'product_price', 'product_quantity', 'category_id'];

  for (const field of requiredFields) {
    if (!body[field]) {
      throw new BadRequestError(`Missing required field: ${field}`);
    }
  }


  // Tìm shop với owner_id xem có tồn tại không
  const shop = await shopModel.findOne({ owner_id: userId });
  if (!shop) {
    throw new NotFoundError('Shop not found for the owner');
  }

  // Kiểm tra xem sản phẩm có tồn tại trong shop đó không
  const existingProduct = await productModel.findOne({
    _id: id,
    shop_id: shop._id
  });
  if (!existingProduct) {
    throw new NotFoundError('Product not found in this shop');
  }

  // Kiểm tra xem nếu product_name có trong body thì tạo lại product_slug
  if (body.product_name) {
    body.product_slug = slugify(body.product_name, { lower: true });
  }

  // Kiểm tra xem sản phẩm đã có tồn tại trước đó hay chưa
  const productToUpdate = await productModel.findByIdAndUpdate(id, body, { new: true });

  if (!productToUpdate) {
    throw new NotFoundError('Product not found');
  }

  return productToUpdate;
}

const deleteProducts = async (ids) => {
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
  page = 1,
  limit = 20,
  sortBy = '-createdAt'
}) => {

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  // Xây dựng truy vấn tìm kiếm
  const query = {
    $text: {
      $search: searchQuery,
      $caseSensitive: false,
      $diacriticSensitive: false
    }
  };

  // Xử lý sắp xếp
  let sortQuery = sortBy;
  if (sortBy === 'sold_count') {
    sortQuery = { sold_count: -1 };
  } else {
    sortQuery = { [sortBy]: 1 };
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
const getProductsByShopIdAndCategoryId = async ({
  shopId, categoryId
}) => {
  const shopExists = await shopModel.exists({ _id: shopId });
  if (!shopExists) {
    throw new NotFoundError('Shop not found');
  }

  const categoryExists = await categoryModel.exists({ _id: categoryId });
  if (!categoryExists) {
    throw new NotFoundError('Category not found');
  }
  const products = await productModel.find({
    shop_id: shopId,
    category_id: categoryId,
    isPublic: true
  }).lean();
  return products;
}

const getProductsByShopId = async (shopId) => {
  const shopExists = await shopModel.exists({ _id: shopId });
  if (!shopExists) {
    throw new NotFoundError('Shop not found');
  }
  const products = await productModel.find({
    shop_id: shopId,
    isPublic: true
  }).lean();
  return products;
}



module.exports = {
  newProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProducts,
  searchProducts,
  uploadProductImages,
  publicProducts,
  privateProducts,
  getProductsByShopIdAndCategoryId,
  getProductsByShopId,
};
