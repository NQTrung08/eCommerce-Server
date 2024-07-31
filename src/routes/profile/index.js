const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const { profiles, profile} = require('../../controllers/profile.controller');

const router = express.Router();

router.get('/viewAny', grantAccess('readAny', 'profile'), profiles)
router.get('/viewOwn', grantAccess('readOwn', 'profile'), profile)

module.exports = router
