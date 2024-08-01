
'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticate } = require('../../middewares/authenticate.middleware');

router.post('/signup', asyncHandler(accessController.signUp));
router.post('/signin', asyncHandler(accessController.signIn));
router.post('/logout', authenticate, asyncHandler(accessController.logOut));

module.exports = router;