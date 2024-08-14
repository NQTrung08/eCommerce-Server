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

module.exports = {
  updateAvatarProfile,
};
  