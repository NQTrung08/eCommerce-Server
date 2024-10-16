'use strict';

const jwt = require('jsonwebtoken');

const createTokenPair = async ( payload ) => {
  try {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { 
      expiresIn: '365d' 
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: '365d'
    });


    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, decode) => {
      if (err) {
        console.log('Invalid access token:', err);
        return err;
      } else {
        console.log('decode::', decode);
      }
    })

    return { accessToken, refreshToken};
    
  } catch (error) {
    console.log('decode::', error);
  }
}

const createAccessToken = async(payload) => {
  try {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { expiresIn: '3d' });
    return accessToken;
  } catch (error) {
    console.log('decode::', error);
  }
}

module.exports = {
  createTokenPair,
  createAccessToken,
}
