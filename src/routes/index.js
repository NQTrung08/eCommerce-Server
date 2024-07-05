const express = require('express');

const router = express.Router();
const { checkApiKey, checkPermissions } = require('../auth/checkAuth')

// check apikey
router.use(checkApiKey)

// check permission
router.use(checkPermissions('0000'))

router.use('/v1/api', require('./access'))



module.exports = router;