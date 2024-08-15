'use strict';

const { BadRequestError } = require('../core/error.response');
const { SuccessReponse } = require('../core/success.response');
const ProfileService = require('../services/profile.service');

class ProfileController {
  
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

  updateProfile = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Profile updated successfully',
      data: await ProfileService.updateProfile({
        id: req.user._id,
        body: req.body
      })
    }).send(res)
  }

  addAddress = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Address added successfully',
      data: await ProfileService.addAddress({
        id: req.user._id,
        newAddress: req.body
      })
    }).send(res)
  }

  getAddresses = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Addresses',
      data: await ProfileService.getAddresses(req.user._id)
    }).send(res)
  }

  updateAddress = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Address updated successfully',
      data: await ProfileService.updateAddress(req.user._id, req.params.addressId, req.body)
    }).send(res)
  }

  deleteAddress = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Address deleted successfully',
      data: await ProfileService.deleteAddress(req.user._id, req.params.addressId)
    }).send(res)
  }

  getProfileOwn = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Profile',
      data: await ProfileService.getProfileOwn({
        id: req.user._id
      })
    }).send(res)
  }

  getProfileForUser = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Profile',
      data: await ProfileService.getProfileForUser({
        id: req.params.id
      })
    }).send(res)
  }

  getProfileForAdmin = async(req, res, next) => {
    return new SuccessReponse({
      message: 'Profile',
      data: await ProfileService.getProfileForAdmin({
        id: req.params.id
      })
    }).send(res)
  }

  getAllProfiles = async (req, res, next) => {
    return new SuccessReponse({
      message: 'All profiles',
      data: await ProfileService.getAllProfiles()
    }).send(res)
  }

  
}

module.exports = new ProfileController;