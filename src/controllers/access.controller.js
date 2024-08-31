
const { CREATED, SuccessReponse } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
  signIn = async(req, res, next) => {
    new SuccessReponse({
      message: 'Login OKKK',
      data: await AccessService.signIn(req.body)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Sign up OK',
      data: await AccessService.signUp(req.body)
    }).send(res);

  }

  logOut = async (req, res, next) => {
    new SuccessReponse({ message: 'Logged out',
      data: await AccessService.logOut(req.user)
     }).send(res)
  
  }

  refreshTokenHandler = async (req, res, next) => {
    new SuccessReponse({ message: 'Refresh token OK',
      data: await AccessService.refreshTokenHandler(req.body)
    }).send(res)
  }

}

module.exports = new AccessController;