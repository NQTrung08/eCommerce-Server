
const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const {listRole, newRole} = require('../../controllers/rbac.controller');
const { asyncHandler } = require('../../auth/checkAuth')
const router = express.Router();

router.get('/roles', asyncHandler(listRole));
router.post('/roles', asyncHandler(newRole));

module.exports = router
