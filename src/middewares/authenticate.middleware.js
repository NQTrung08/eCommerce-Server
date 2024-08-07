const jwt = require('jsonwebtoken');
const keyTokenModel = require('../models/keytoken.model');
const roleModel = require('../models/role.model');

const authenticate = async (req, res, next) => {

  const authorizationHeader = req.header('Authorization');
  
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
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
    if(decoded.status == 'block') {
      return res.status(403).json({ message: 'You was block access' });
    }
    
    req.user = decoded;
    console.log("decode::", decoded)
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const verifyShop = async (req, res, next) => {
  const role = roleModel.findById(req.user.roles); 

  if (!role.roleName == 'shop') {
    return res.status(403).json({ message: 'Shop access denied' });
  }
  
  next();
};

const verifyAdmin = async (req, res, next) => {
  const role = roleModel.findById(req.user.roles);
  if (!role.roleName == 'admin') {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  
  next();
};

module.exports = {
  authenticate,
  verifyAdmin,
};