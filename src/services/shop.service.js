'use strict';

const shopModel = require('../models/shop.model')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

const { ConflictError, BadRequestError, InternalServerError, NotFoundError } = require('../core/error.response');
const { uploadShopLogo } = require('./upload.service');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const { includes } = require('lodash');
const reviewModel = require('../models/review.model');


const newShop = async ({ owner_id, body, file }) => {
  try {
    // Kiểm tra nếu owner_id đã có shop
    const existingShop = await shopModel.findOne({ owner_id: owner_id });

    if (existingShop) {
      throw new BadRequestError("You can't create a new shop");
    }

    const shop = await shopModel.findOne({
      shop_name: body.shop_name,
      owner_id: owner_id,
    });


    if (shop) {
      throw new BadRequestError('Shop name already exists');
    }

    const shopRole = await roleModel.findOne({ roleName: 'shop' }).lean();
    if (!shopRole) {
      throw new InternalServerError('Default role not found');
    }

    const newShop = new shopModel({
      owner_id: owner_id,
      shop_name: body.shop_name,
      address: body.address,
      phone_number: body.phone_number,
      description: body.description,
    });


    // Lưu shop vào database và lấy shop id
    const savedShop = await newShop.save();

    // Nếu có ảnh logo, upload và cập nhật lại
    if (file) {
      const uploadResult = await uploadShopLogo({
        filePath: file.path,
        shopId: savedShop._id.toString(), // Sử dụng ID của shop đã lưu
      });

      savedShop.logo = uploadResult.secure_url;
      await savedShop.save(); // Cập nhật logo URL vào shop
    }

    // update roles cho owner
    await userModel.findOneAndUpdate(
      { _id: owner_id },
      { $addToSet: { roles: shopRole._id } }, // Thêm quyền mới vào danh sách roles
      { new: true } // Trả về tài liệu đã được cập nhật
    );

    return savedShop;
  } catch (error) {
    console.log('[E]::newShop::', error);
    throw error;
  }
};

const getAllShopForUser = async () => {
  const shop = await shopModel.find()

  return shop
}

const getAllShops = async ({
  page = 1,
  limit = 4,
  sortBy = 'asc',
  query = {},
  includeStatistics = false,  // Thêm tham số để kiểm soát việc lấy thống kê
  year = "all",
}) => {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const sortOrder = sortBy.toLowerCase() === 'desc' ? -1 : 1;
  let totalRevenueEcommerce = 0;
  let totalOrdersEcommerce = 0;
  const searchQuery = {};
  if (query.shop_name) {
    searchQuery.shop_name = new RegExp(query.shop_name, 'i');
  }

  const shops = await shopModel.find(searchQuery)
    .populate({
      path: 'owner_id',
      select: 'userName roles',
    })
    .sort({ shop_name: sortOrder })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

  const totalShops = await shopModel.countDocuments(searchQuery);

  // Lấy thống kê doanh thu cho từng cửa hàng nếu `includeStatistics` là `true`
  if (includeStatistics) {
    for (let shop of shops) {
      const stats = await getShopsStatisticsForAdmin({ year, shop_id: shop._id });
      shop.statistics = stats.length ? stats[0] : null;
      // total all revenue
      shop.total_revenue = Object.values(shop.statistics || {}).reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
      shop.order_count = Object.values(shop.statistics || {}).reduce((acc, curr) => acc + (curr.orderCount || 0), 0);
      totalRevenueEcommerce += shop.total_revenue;
      totalOrdersEcommerce += shop.order_count;
    }
  }

  return {
    totalShops,
    totalRevenueEcommerce,
    totalOrdersEcommerce,
    totalPages: Math.ceil(totalShops / limitNumber),
    currentPage: pageNumber,
    shops,
  };
};



const getShopForAdmin = async ({ id, year = 'all' }) => {

  const shop = await shopModel.findById(id).lean();
  const productsCount = await productModel.countDocuments({ shop_id: id });
  const reviewsCount = await reviewModel.countDocuments({ shop_id: id });
  const stats = await getStatisticsForShop(shop._id, year);


  if (!shop) {
    throw new NotFoundError('Shop not found');
  }
  // Check role of user
  shop.statistics = stats.length ? stats[0] : null;
  return {
    shop,
    productsCount,
    reviewsCount
  };



};

const getShop = async ({ id, year }) => {

  const shop = await shopModel.findById(id).lean();
  const productsCount = await productModel.countDocuments({ shop_id: id });
  const reviewsCount = await reviewModel.countDocuments({ shop_id: id });
  const stats = await getStatisticsForShop(shop._id, year);


  if (!shop) {
    throw new NotFoundError('Shop not found');
  }
  
  return {
    shop,
    productsCount,
    reviewsCount
  }


};

const getShopByOwnerId = async ({
  owner_id, includeStatistics = false, year = "all"
}) => {
  const shop = await shopModel.findOne({ owner_id })
    .populate({ path: 'owner_id' })
    .lean();

  if (!shop) {
    throw new BadRequestError('Shop not found');
  }

  if (includeStatistics) {
    const stats = await getStatisticsForShop(shop._id, year);
    shop.statistics = stats.length ? stats[0] : null;
  }

  return shop;
};



const updateShop = async (id, body) => {
  const shop = await shopModel.findByIdAndUpdate(id, body, { new: true }).lean();

  if (!shop) {
    throw new BadRequestError('Shop not found');
  }

  return shop;

};


const deleteShop = async (id) => {
  const shop = await shopModel.findByIdAndDelete(id).lean();

  if (!shop) {
    throw new ConflictError('Shop not found');
  }

  return shop;

};

const getShopsStatisticsForAdmin = async ({ year = "all", shop_id = null }) => {
  const filter = shop_id ? { _id: shop_id } : {};
  const shops = await shopModel.find(filter).lean();
  const statistics = [];

  for (const shop of shops) {
    const shopStats = await getStatisticsForShop(shop._id, year);
    statistics.push({
      ...shopStats,
    }
    );
  }

  return statistics;
};


const getStatisticsForShop = async (shopId, year) => {
  const matchCondition = {
    order_shopId: shopId,
  };

  // Kiểm tra nếu `year` được cung cấp, thêm điều kiện cho các đơn hàng trong năm đó
  if (year !== 'all') {
    const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59Z`);
    matchCondition.createdAt = { $gte: startOfYear, $lte: endOfYear };
  }

  // Sử dụng `aggregate` để tính toán doanh thu và tổng số đơn hàng theo ngày, tháng và năm
  const statistics = await orderModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }, // Thêm nhóm theo ngày
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ["$order_status", "completed"] }, "$order_total_price", 0],
          },
        },
        orderCount: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }, // Sắp xếp theo năm, tháng, ngày
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        day: '$_id.day',
        totalRevenue: 1,
        orderCount: 1,
      },
    },
  ]);

  return statistics;
};



const getPlatformRevenue = async ({
  startDate,
  endDate,
  groupBy = 'month'
}) => {
  const dateFilter = {
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  // Xác định nhóm dữ liệu theo 'year', 'month' hoặc 'day'
  const groupStage = (() => {
    if (groupBy === 'year') {
      return {
        _id: { year: { $year: "$createdAt" } },
        totalRevenue: { 
          $sum: { 
            $cond: [{ $eq: ["$order_status", "completed"] }, "$order_total_price", 0] 
          } 
        },
        totalOrders: { $sum: 1 }
      };
    } else if (groupBy === 'month' || groupBy === '') {
      return {
        _id: { 
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalRevenue: { 
          $sum: { 
            $cond: [{ $eq: ["$order_status", "completed"] }, "$order_total_price", 0] 
          } 
        },
        totalOrders: { $sum: 1 }
      };
    } else if (groupBy === 'day') {
      return {
        _id: { 
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        totalRevenue: { 
          $sum: { 
            $cond: [{ $eq: ["$order_status", "completed"] }, "$order_total_price", 0] 
          } 
        },
        totalOrders: { $sum: 1 }
      };
    } else {
      throw new BadRequestError('Invalid groupBy parameter. It should be either "year", "month", or "day".');
    }
  })();

  const sortStage = (() => {
    if (groupBy === 'year') {
      return { "_id.year": 1 };
    } else if (groupBy === 'month' || groupBy === '') {
      return { "_id.year": 1, "_id.month": 1 };
    } else if (groupBy === 'day') {
      return { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
    }
  })();

  // Thực hiện truy vấn
  const statistics = await orderModel.aggregate([
    { $match: dateFilter },
    { $group: groupStage },
    { $sort: sortStage }
  ]);

  // Tạo đối tượng chứa dữ liệu đầy đủ cho tất cả các tháng hoặc ngày
  const result = [];

  if (groupBy === 'year') {
    const year = new Date(startDate).getFullYear(); // Lấy năm từ startDate
    result.push({
      year,
      totalRevenue: statistics[0]?.totalRevenue || 0,
      totalOrders: statistics[0]?.totalOrders || 0
    });
  } else if (groupBy === 'month') {
    for (let i = 1; i <= 12; i++) {
      const monthData = statistics.find(stat => stat._id.month === i) || { totalRevenue: 0, totalOrders: 0 };
      result.push({
        year: statistics[0]?._id.year,
        month: i,
        totalRevenue: monthData.totalRevenue,
        totalOrders: monthData.totalOrders
      });
    }
  } else if (groupBy === 'day') {
    const year = new Date(startDate).getFullYear();
    const month = new Date(startDate).getMonth() + 1; // Month in JavaScript starts from 0
    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month

    for (let i = 1; i <= daysInMonth; i++) {
      const dayData = statistics.find(stat => stat._id.day === i) || { totalRevenue: 0, totalOrders: 0 };
      result.push({
        year,
        month,
        day: i,
        totalRevenue: dayData.totalRevenue,
        totalOrders: dayData.totalOrders
      });
    }
  }

  return result;
};





module.exports = {
  newShop,
  getAllShops,
  getShopByOwnerId,
  getShop,
  updateShop,
  deleteShop,
  getAllShopForUser,
  getShopsStatisticsForAdmin,
  getShopForAdmin,
  getPlatformRevenue
};