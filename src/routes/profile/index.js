const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const ProfileController = require('../../controllers/profile.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();


router.get('/own', authenticate, asyncHandler(ProfileController.getProfileOwn));
router.get('/admin/:id', authenticate, authorize(['admin']), asyncHandler(ProfileController.getProfileForAdmin));
router.get('/', authenticate, authorize(['admin']), asyncHandler(ProfileController.getAllProfiles));

router.post('/avatar-own', authenticate, uploadStorage.single('file'), asyncHandler(ProfileController.updateAvatar));
router.post('/own', authenticate, asyncHandler(ProfileController.updateProfile));
router.post('/change-password', authenticate, asyncHandler(ProfileController.changePassword));

router.post('/address', authenticate, asyncHandler(ProfileController.addAddress));
router.get('/addresses', authenticate, asyncHandler(ProfileController.getAddresses));
router.put('/address/:addressId', authenticate, asyncHandler(ProfileController.updateAddress));
router.delete('/address/:addressId', authenticate, asyncHandler(ProfileController.deleteAddress));

router.get('/:id', asyncHandler(ProfileController.getProfileForUser));
module.exports = router
