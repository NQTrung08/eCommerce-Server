
const express = require('express');
const { authorize, authenticate } = require('../../middewares/authenticate.middleware');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { getAllUsers, getCustomers } = require('../../controllers/user.controller');
const router = express.Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(getAllUsers))
router.get('/customers', authenticate, authorize(['admin', 'shop']), asyncHandler(getCustomers))



module.exports = router