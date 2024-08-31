
'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticate } = require('../../middewares/authenticate.middleware');

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: API endpoints related to user operations.
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng ký người dùng mới
 *     description: API này đăng ký một người dùng mới.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', asyncHandler(accessController.signUp));


/**
 * @swagger
 * /signin:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng nhập người dùng
 *     description: API này đăng nhập một người dùng đã tồn tại.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User signed in successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/signin', asyncHandler(accessController.signIn));

/**
 * @swagger
 * /logout:
 *   post: 
 *     tags:
 *       - User
 *     summary: Đăng xuất người dùng
 *     description: API này đăng xuất một người dùng đã tồn tại.
 * description: Unauthorized
 */
router.post('/logout', authenticate, asyncHandler(accessController.logOut));
router.post('/refresh-token', asyncHandler(accessController.refreshTokenHandler));


module.exports = router;