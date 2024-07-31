'use strict';

const ProfileService = require('../services/profile.service');

class ProfileController {
  profiles = async(req, res, next) => {
    new SuccessReponse({
      message: 'All profiles',
      data: await ProfileService.getAllProfiles(),
    })
  }

  profile = async(req, res, next) => {
    const { id } = req.params;
    new SuccessReponse({
      message: 'Profile',
      data: await ProfileService.getProfileById(id),
    })
  }
  
}

module.exports = new ProfileController;