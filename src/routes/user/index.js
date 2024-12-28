
const express = require('express');
const { authorize, authenticate } = require('../../middewares/authenticate.middleware');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { getAllUsers, getCustomers, blockUser } = require('../../controllers/user.controller');
const router = express.Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(getAllUsers))
router.get('/customers', authenticate, authorize(['admin', 'shop']), asyncHandler(getCustomers))
router.put('/block', authenticate, authorize(['admin']), asyncHandler(blockUser))



module.exports = router