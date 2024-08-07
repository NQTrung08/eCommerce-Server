
const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const {listRole, newRole, updateRole} = require('../../controllers/rbac.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const router = express.Router();

router.get('/roles', asyncHandler(listRole));
router.post('/roles', asyncHandler(newRole));
router.put('/roles/:id', asyncHandler(updateRole));

module.exports = router
