const express = require('express');
const { grantAccess } = require('../../middewares/rbac');
const TemplateController = require('../../controllers/template.controller');
const { authenticate, authorize } = require('../../middewares/authenticate.middleware')
const { asyncHandler } = require('../../helpers/asyncHandler');
const { uploadStorage } = require('../../configs/multer.config');
const router = express.Router();


router.get('/', authenticate, authorize(['admin']), asyncHandler(TemplateController.getTemplate));
router.post('/', authenticate, authorize(['admin']), asyncHandler(TemplateController.createTemplate));
module.exports = router


