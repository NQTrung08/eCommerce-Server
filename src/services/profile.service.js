const shopModel = require('../models/shop.model')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

const { ConflictError, BadRequestError, InternalServerError, NotFoundError } = require('../core/error.response');
const { uploadUserAvatar } = require('./upload.service');
const bcrypt = require('bcrypt');



const updateAvatarProfile = async ({
  id,
  filePath,
}) => {
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
}

const getProfileOwn = async ({ id }) => {
  const user = await userModel.findById(id)
    .populate('roles');

  if (!user) {
    throw new ConflictError('User not found');
  }

  return user;
}

const getProfileForUser = async ({ id }) => {
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
}

const getProfileForAdmin = async ({ id }) => {

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
}

const getAllProfiles = async () => {

  const users = await userModel.find({})
    .populate({
      path: 'roles',
      select: 'roleName',
    })
    .select('-password');
  return users;
}

const updateProfile = async ({
  id,
  body,
}) => {
  const { email, password, ...updateData } = body;
  const user = await userModel.findByIdAndUpdate(id, ...updateData, { new: true });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}


// Change the user's password
// POST /api/profile/change-password
const changePassword = async ({ id, currentPassword, newPassword }) => {
  const user = await userModel.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if the current password is correct
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Hash the new password before saving
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword; // Update password field
  await user.save();

  return user;
}

const addAddress = async ({
  id,
  newAddress,
}) => {
  const user = await userModel.findOneAndUpdate(
    { _id: id },
    { $push: { address: newAddress } }, // Thêm địa chỉ mới vào mảng
    { new: true }
  );
  return user.address;
}

const getAddresses = async ({userId}) => {
  const user = await userModel.findOne({ _id: userId }).select('address');
  return user ? user.address : [];
};

const updateAddress = async (userId, addressId, updatedAddress) => {
  const user = await userModel.findOneAndUpdate(
    { _id: userId, 'address._id': addressId },
    { $set: { 'address.$': updatedAddress } }, // Cập nhật địa chỉ tại vị trí cụ thể
    { new: true }
  );
  return user;
};

const deleteAddress = async (userId, addressId) => {
  const user = await userModel.findOneAndUpdate(
    { _id: userId },
    { $pull: { address: { _id: addressId } } }, // Xóa địa chỉ dựa trên ID
    { new: true }
  );
  return user;
};



module.exports = {
  updateAvatarProfile,
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getProfileOwn,
  getProfileForUser,
  getProfileForAdmin,
  getAllProfiles,
};
