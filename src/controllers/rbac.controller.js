
const RoleService = require('../services/rbac.service');


const listRole = async (req, res, next) => {
    return res.status(200).json(
      { message: "Roles list",
        data: await RoleService.getGrantList()
      });
}

const newRole = async (req, res, next) => {
  return res.status(200).json(
    { message: "Create Role",
      data: await RoleService.createRole(req.body)
    });
}

const updateRole = async (req, res, next) => {
  return res.status(200).json(
    { message: "Update Role",
      data: await RoleService.updateRole(req.params.id, req.body)
    });
}

module.exports = {
  listRole,
  newRole,
  updateRole
};