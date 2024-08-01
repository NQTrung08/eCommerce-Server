const jwt = require('jsonwebtoken');
const keyTokenModel = require('../models/keytoken.model');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    
    const tokenRecord = await keyTokenModel.findOne({
      userId: decoded._id,
    });

    if (!tokenRecord) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    req.user = decoded;
    console.log("decode::", decoded)
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  authenticate,
};