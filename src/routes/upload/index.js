
'use strict';

const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { uploadStorage } = require('../../configs/multer.config')

const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

// avatar

// logo shop
router.post('/shopLogo', authenticate, authorize(['shop']), uploadStorage.single('file'),  asyncHandler(uploadController.uploadShopLogo));

// product
router.post('/product/:id/thumb', authenticate, authorize(['shop']), uploadStorage.single('file'),  asyncHandler(uploadController.uploadThumbnail));

module.exports = router