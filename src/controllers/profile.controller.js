'use strict';

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
  
}

module.exports = new ProfileController;