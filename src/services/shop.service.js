'use strict';

const shopModel = require('../models/shop.model')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

const { ConflictError, BadRequestError, InternalServerError } = require('../core/error.response');
const { uploadShopLogo } = require('./upload.service');


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

const getAllShop = async ({
  page = 1,
  limit = 4,
  sortBy = 'asc',
  query = {},
}) => {
  try {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    console.log(query)

    // Xác định thứ tự sắp xếp (1: A-Z, -1: Z-A)
    const sortOrder = sortBy.toLowerCase() === 'desc' ? -1 : 1;

    const searchQuery = {};
    if (query.shop_name) {
      searchQuery.shop_name = new RegExp(query.shop_name, 'i'); // Tìm kiếm không phân biệt chữ hoa chữ thường
    }

    const shops = await shopModel.find(searchQuery)
      .populate({
        path: 'owner_id',
        select: 'userName roles',
      })
      .sort({
        shop_name: sortOrder,
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();
    
    const totalShops = await shopModel.countDocuments();

    return {
      shops,
      totalShops,
      totalPages: Math.ceil(totalShops / limitNumber),
      currentPage: pageNumber,
    };

  } catch (error) {
    console.log('[E]::getAllShop::', error);
    throw error;
  }
}


const getShop = async ({ id }) => {
  try {
    console.log('[E]::getShop', id)
    const shop = await shopModel.findById(id).lean();

    if (!shop) {
      throw new ConflictError('Shop not found');
    }

    return shop;
  } catch (error) {
    console.log('[E]::getShopById::', error);
    throw error;
  }
};

const getShopByOwnerId = async (owner_id) => {
  try {
    const shop = await shopModel.findOne({ owner_id })
    .populate({
      path: 'owner_id',
    })
    .lean();

    if (!shop) {
      throw new ConflictError('Shop not found');
    }

    return shop;
  } catch (error) {
    console.log('[E]::getShopByOwnerId::', error);
    throw error;
  }
};


const updateShop = async (id, body) => {
  try {
    const shop = await shopModel.findByIdAndUpdate(id, body, { new: true }).lean();

    if (!shop) {
      throw new ConflictError('Shop not found');
    }

    return shop;
  } catch (error) {
    console.log('[E]::updateShop::', error);
    throw error;
  }
};


const deleteShop = async (id) => {
  try {
    const shop = await shopModel.findByIdAndDelete(id).lean();

    if (!shop) {
      throw new ConflictError('Shop not found');
    }

    return shop;
  } catch (error) {
    console.log('[E]::deleteShop::', error);
    throw error;
  }
};


module.exports = {
  newShop,
  getAllShop,
  getShopByOwnerId,
  getShop,
  updateShop,
  deleteShop,
};