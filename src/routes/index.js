const express = require('express');

const router = express.Router();
// const { checkApiKey, checkPermissions } = require('../auth/checkAuth')

// check apikey
// router.use(checkApiKey)

// check permission
// router.use(checkPermissions('0000'))

router.use('/v1/api', require('./access'))
router.use('/v1/api/auth', require('./auth'))
router.use('/v1/api/rbac', require('./rbac'))
router.use('/v1/api/profile', require('./profile'))
router.use('/v1/api/category', require('./category'))
router.use('/v1/api/shop', require('./shop'))
router.use('/v1/api/upload', require('./upload'))

router.use('/v1/api/product', require('./product'))
router.use('/v1/api/otp', require('./otp'))
// router.use('/v1/api/checkout', require('./checkout'))
router.use('/v1/api/cart', require('./cart'))
// router.use('/v1/api/inventory', require('./inventory'))
router.use('/v1/api/order', require('./order'))
router.use('/v1/api/transaction', require('./transaction'))
router.use('/v1/api/catalogShop', require('./catalog'))
router.use('/v1/api/template', require('./template'))



module.exports = router;