'use strict';

const jwt = require('jsonwebtoken');

const createTokenPair = async ( payload ) => {
  try {
    const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { 
      expiresIn: '1h' 
    });
    
    const refreshToken = await jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: '7d'
    });

    jwt.verify(accessToken, process.env.jwtAccessToken, (err, decode) => {
      if (err) {
        console.log('Invalid access token:', err);
        return null;
      } else {
        console.log('decode::', decode);
      }
    })

    return { accessToken, refreshToken  };
    
  } catch (error) {
    console.log('decode::', error);
  }
}

module.exports = {
  createTokenPair,
}