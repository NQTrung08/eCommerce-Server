'use strict';

const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler')

const OTPController = require('../../controllers/otp.controller');
 
const router = express.Router();


router.post('/send-otp', asyncHandler(OTPController.requestOTP));
router.post('/verify-otp', asyncHandler(OTPController.verifyOTP));
module.exports = router