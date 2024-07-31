'use strict';

const rbac = require('./role.middeware')

/**
 * @param (string) action // read,delete or update
 * @param (*) resource // profile, balance,..
 */

const grantAccess = (action, resource) => {
  
  return async(req, res, next) => {

    try {
      const roleName = req.query.role;
      const permission = rbac.can(roleName)[action](resource)
      if (permission.granted) {
        throw new AuthFailureError('you dont have enough permission...')
      }
      
      next()
        
      } catch (err) {
        next(err)
      }
    }
}

module.exports = {
  grantAccess
}