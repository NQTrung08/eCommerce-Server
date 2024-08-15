const shopModel = require('../models/shop.model')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

const { ConflictError, BadRequestError, InternalServerError } = require('../core/error.response');
const { uploadUserAvatar } = require('./upload.service');



const updateAvatarProfile = async({
  id,
  filePath,
}) => {
  try {
    const user = await userModel.findById(id);

    if (!user) {
      throw new ConflictError('User not found');
    }


    // Nếu có ảnh logo, upload và cập nhật lại
    if (filePath) {
      const uploadResult = await uploadUserAvatar({
        filePath: filePath,
        userId: user._id.toString(), // Sử dụng ID của shop đã lưu
      });

      user.avatar = uploadResult.secure_url;
      await user.save();
    }

    return user;
    

    // Nếu có ảnh avatar, upload và cập nhật lại
    } catch(error) {
      console.log('[E]::uploadAvatarProfile::', error);
      throw error;
    }
}

const getProfileOwn = async({id}) => {
  try {
    const user = await userModel.findById(id)
    .populate('roles');

    if (!user) {
      throw new ConflictError('User not found');
    }

    return user;
  } catch (error) {
    console.log('[E]::getProfileOwn::', error);
    throw error;
  }
}

const getProfileForUser = async ({id}) => {
  try {
    
    const user = await userModel.findById(id)
    .select({
      userName: 1,
      avatar: 1,
      _id: 0
    });

    if (!user) {
      throw new ConflictError('User not found');
    }

    return user;
  } catch (error) {
    console.log('[E]::getProfile::', error);
    throw error;
  }
}

const getProfileForAdmin = async ({id}) => {
  try {
    
    const user = await userModel.findById(id)
    .populate({
      path: 'roles',
      select: 'roleName',
    })
    .select('-password');

    if (!user) {
      throw new ConflictError('User not found');
    }

    return user;
  } catch (error) {
    console.log('[E]::getProfile::', error);
    throw error;
  }
}

const getAllProfiles = async () => {
  try {
    const users = await userModel.find({})
    .populate({
      path: 'roles',
      select: 'roleName',
    })
    .select('-password');
    return users;
  } catch (error) {
    console.log('[E]::getAllProfiles::', error);
    throw error;
  }
}

const updateProfile = async ({
  id,
  body,
}) => {     
  try {
    const user = await userModel.findByIdAndUpdate(id, body, { new: true });

    if (!user) {
      throw new ConflictError('User not found');
    }

    return user;
  } catch (error) {
    console.log('[E]::updateProfile::', error);
    throw error;
  }
}

const addAddress = async({
  id,
  newAddress,
}) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { userId: id },
      { $push: { address: newAddress } }, // Thêm địa chỉ mới vào mảng
      { new: true }
    );
    return user.address;
  } catch (error) {
    throw new Error('Error adding address: ' + error.message);
  }
}

const getAddresses = async (userId) => {
  try {
    const user = await userModel.findOne({ userId: userId }).select('address');
    return user ? user.address : [];
  } catch (error) {
    throw new Error('Error fetching addresses: ' + error.message);
  }
};

const updateAddress = async (userId, addressId, updatedAddress) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { userId: userId, 'address._id': addressId },
      { $set: { 'address.$': updatedAddress } }, // Cập nhật địa chỉ tại vị trí cụ thể
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error('Error updating address: ' + error.message);
  }
};

const deleteAddress = async (userId, addressId) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { userId: userId },
      { $pull: { address: { _id: addressId } } }, // Xóa địa chỉ dựa trên ID
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error('Error deleting address: ' + error.message);
  }
};



module.exports = {
  updateAvatarProfile,
  updateProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getProfileOwn,
  getProfileForUser,
  getProfileForAdmin,
  getAllProfiles,
};
  