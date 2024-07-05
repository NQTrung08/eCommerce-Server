'use strict';

const jwt = require('jsonwebtoken');

const createTokenPair = async ( payload, publicKey, privateKey ) => {
  try {
    const accessToken = await jwt.sign(payload, privateKey, { 
      algorithm: 'RS256',
      expiresIn: '1h' 
    });
    
    const refreshToken = await jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7d'
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log('Invalid access token:', err);
        return null;
      } else {
        console.log('decode::', decode);
      }
    })

    return { accessToken, refreshToken  };
    
  } catch (error) {
    
  }
}

module.exports = {
  createTokenPair,
}