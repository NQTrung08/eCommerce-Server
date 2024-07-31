
const AccessService = require('../services/access.service');

class AccessController {
  signIn = async(req, res, next) => {
    return res.status(200).json(await AccessService.signIn(req.body));
  }

  signUp = async (req, res, next) => {
    return res.status(200).json(await AccessService.signUp(req.body));

  }

}

module.exports = new AccessController;