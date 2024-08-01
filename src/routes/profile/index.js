const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const { profiles, profile} = require('../../controllers/profile.controller');
const { authenticate } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const router = express.Router();

router.get('/viewAny',authenticate, grantAccess('readAny', 'profile'), asyncHandler(profiles));
router.get('/viewOwn',authenticate, grantAccess('readOwn', 'profile'), asyncHandler(profile))

module.exports = router
