
'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../auth/checkAuth')

router.post('/signup', asyncHandler(accessController.signUp));
router.post('/signin', asyncHandler(accessController.signIn));

module.exports = router;