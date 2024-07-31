
'use strict';


const { Header: { API_KEY, AUTHORIZATION } } = require('../constant/index')

const { findById } = require('../services/apiKey.service')

const checkApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers[API_KEY]?.toString();

    if (!apiKey) {
      return res.status(403).json({ message: 'Forbidden Error' });
    }

    // check objKey
    const objKey = await findById(apiKey)
    if (!objKey) {
      return res.status(403).json({ message: 'Forbidden Error' });
    }

    req.objKey = objKey;
    return next()


  } catch (error) {
    next(error);

  }
}

const checkPermissions = ( permission ) => {
  return (req, res, next) => {
    if(!req.objKey.permissions) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    console.log("Permission::",req.objKey.permissions);


    if (!req.objKey.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    return next()
  }
}


const asyncHandler = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
    // fn là 1 hàm async nên trả về 1 promise
    // => ta có thể dùng then() hoặc catch()
    // do then() là theo xử lý đúng nên dùng catch() để chuyển lỗi
  }
}

module.exports = {
  checkApiKey,
  checkPermissions,
  asyncHandler
}