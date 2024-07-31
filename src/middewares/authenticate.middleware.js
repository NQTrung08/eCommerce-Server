const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken || req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticate;