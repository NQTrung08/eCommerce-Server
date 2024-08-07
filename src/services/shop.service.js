'use strict';

const shopModel = require('../models/shop.model')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

const { ConflictError, BadRequestError } = require('../core/error.response')


const newShop = async ({ owner_id, body }) => {
  try {
    console.log(body);

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
      logo: body.logo,
      address: body.address,
      phone_number: body.phone_number,
      description: body.description,
    });

    // update roles cho owner
    await userModel.findOneAndUpdate(
      { _id: owner_id },
      { $addToSet: { roles: shopRole._id } }, // Thêm quyền mới vào danh sách roles
      { new: true } // Trả về tài liệu đã được cập nhật
    );

    return await newShop.save();
  } catch (error) {
    console.log('[E]::newShop::', error);
    throw error;
  }
};

const getAllShop = async () => {
  try {
    const shops = await shopModel.find()
    .populate({
      path: 'owner_id',
      select: 'userName roles',
    })
    .lean();

    return shops;
  } catch (error) {
    console.log('[E]::getAllShop::', error);
    throw error;
  }
}


const getShop = async (id) => {
  try {
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
    const shop = await shopModel.findOne({ owner_id }).lean();

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