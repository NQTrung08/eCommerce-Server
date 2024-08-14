const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ProfileController = require('../../controllers/profile.controller');
const { authenticate } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();

// router.get('/viewAny',authenticate, grantAccess('readAny', 'profile'), asyncHandler(profiles));
// router.get('/viewOwn',authenticate, grantAccess('readOwn', 'profile'), asyncHandler(profile))


router.post('/avatar-own', authenticate, uploadStorage.single('file'), asyncHandler(ProfileController.updateAvatar));
module.exports = router
