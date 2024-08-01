'use strict';

const jwt = require('jsonwebtoken');

const createTokenPair = async ( payload ) => {
  try {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { 
      expiresIn: '3d' 
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: '7d'
    });

    const accessTokenExpiry = new Date(Date.now() + 3 * 24 * 3600 * 1000); // 3 days
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days


    jwt.verify(accessToken, process.env.jwtAccessToken, (err, decode) => {
      if (err) {
        console.log('Invalid access token:', err);
        return null;
      } else {
        console.log('decode::', decode);
      }
    })

    return { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry };
    
  } catch (error) {
    console.log('decode::', error);
  }
}

module.exports = {
  createTokenPair,
}