
'use strict';

const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

router.post('/product', asyncHandler(uploadController.uploadFile));

module.exports = router