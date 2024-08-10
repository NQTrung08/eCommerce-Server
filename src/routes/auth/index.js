const express = require('express');
const passport = require('passport');
const { createTokenPair } = require('../../auth/authUtils');
const { ConflictError, InternalServerError, BadRequestError } = require('../../core/error.response');
const keyTokenService = require('../../services/keyToken.service');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google',{ session: false }),
  async (req, res) => { 
    console.log('User Info:', req.user);
    // Success redirect or return JWT token
    const tokens = await createTokenPair({
      _id: req.user._id,
      email: req.user.email,
      roles: req.user.roles,
      status: req.user.status
    });

    const keyStore = await keyTokenService.createKeyToken({
      userId: req.user._id,
      refreshToken: tokens.refreshToken,
    })
    if (!keyStore) {
      throw new InternalServerError('Failed to save keyStore')
    }


    res.json({ user: req.user, tokens });
  }
);

module.exports = router;
