const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  console.log(token);
  
  if (!token) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
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