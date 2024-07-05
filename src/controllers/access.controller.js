
const AccessService = require('../services/access.service');

class AccessController {
  logIn = function (req, res, next) {
    try {
      return res.status(200).json({
        message: 'Login success',

      })

    } catch (error) {
      next(error);
    }

  }

  signUp = async (req, res, next) => {
    return res.status(200).json(await AccessService.signUp(req.body));

  }

}

module.exports = new AccessController;