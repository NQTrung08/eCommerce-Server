
'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticate } = require('../../middewares/authenticate.middleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


/**
 * @swagger
 * tags:
 *   - name: Access
 *     description: API endpoints related to user operations.
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - Access
 *     summary: Đăng ký người dùng mới
 *     description: API này đăng ký một người dùng mới.
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
 *       - Access
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
 *       - Access
 *     summary: Đăng xuất người dùng
 *     description: API này đăng xuất người dùng bằng cách vô hiệu hóa access token hiện tại.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         description: Unauthorized - Token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post('/logout', authenticate, asyncHandler(accessController.logOut));

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     tags:
 *       - Access
 *     summary: Cấp mới access token
 *     description: API này cấp một access token mới bằng cách sử dụng refresh token hiện có trong body của yêu cầu.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Access token hiện tại cần được làm mới.
 *     responses:
 *       200:
 *         description: Cấp mới access token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Access token mới được cấp.
 *       400:
 *         description: Bad Request - Access token không được cung cấp hoặc không hợp lệ
 *       401:
 *         description: Unauthorized - Refresh token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post('/refresh-token', asyncHandler(accessController.refreshTokenHandler));

// TODO: forgot password

router.post('/forgot-password', asyncHandler(accessController.forgotPasswordHandler));


module.exports = router;