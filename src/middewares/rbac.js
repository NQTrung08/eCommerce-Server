'use strict';

const rbac = require('./role.middeware')
const roleModel = require('../models/role.model');
const { NotFoundError, AuthFailureError } = require('../core/error.response');
const { getGrantList } = require('../services/rbac.service');
/**
 * @param (string) action // read,delete or update
 * @param (*) resource // profile, balance,..
 */

const grantAccess = (action, resource) => {
  
  return async(req, res, next) => {

    try {
      rbac.setGrants( await getGrantList());
      const roleId = req.user.roles;
      const role = await roleModel.findById(roleId).populate({
        path: 'rol_grants.resource',
        select: 'resourceName'
      });
      
      console.log(role)
      if (!role) {
        throw new NotFoundError('Role not found.');
    }
      
      const permission = rbac.can(role.roleName)[action](resource)

      console.log('Permission', permission)
      if (permission.granted) {
        next()
      } else {
        throw new AuthFailureError('Insufficient permissions.');
      }
    
      } catch (err) {
        next(err)
      }
    }
}

module.exports = {
  grantAccess
}