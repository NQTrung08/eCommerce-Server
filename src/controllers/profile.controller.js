'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessReponse } = require('../core/success.response');
const ProfileService = require('../services/profile.service');

class ProfileController {
  profiles = async(req, res, next) => {
    return res.status(200).json({
      message: 'All profiles',
      data: {
        message: "All profiles"
      },
    })
  }

  profile = async(req, res, next) => {
    const { id } = req.params;
    return res.status(200).json({
      message: 'Profile',
      data: {
        message: "Profile",
      },
    })
  }

  updateAvatar = async(req, res, next) => {
    const file = req.file;
    console.log(file.path);
    if (!file) {
      throw new BadRequestError('File not found')
    }
    new SuccessReponse({
      message: "User avatar uploaded successfully",
      data: await ProfileService.updateAvatarProfile({
        id: req.user._id,
        filePath: file.path
      })
    }).send(res)
  }
  
}

module.exports = new ProfileController;