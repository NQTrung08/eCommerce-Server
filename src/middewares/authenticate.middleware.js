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
    if (decoded.status == 'block') {
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
  const userRoles = await roleModel.find({ _id: { $in: req.user.roles } });
  const hasRequiredRole = userRoles.map(role => role.roleName);
  const shopRole = hasRequiredRole.includes('shop')
  if (!shopRole) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

const verifyAdmin = async (req, res, next) => {
  const userRoles = await roleModel.find({ _id: { $in: req.user.roles } });
  const hasRequiredRole = userRoles.map(role => role.roleName);
  const adminRole = hasRequiredRole.includes('admin')
  if (!adminRole) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

const authorize = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userRoles = await roleModel.find({ _id: { $in: req.user.roles } });

      console.log(userRoles);
      const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role.roleName));

      if (!hasRequiredRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: 'Access denied' });
    }
  };
};

module.exports = {
  authenticate,
  verifyAdmin,
  verifyShop,
  authorize,
};