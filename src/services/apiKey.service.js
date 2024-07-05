'use strict';

const apiKeyModel = require("../models/apiKey.model");

// find ApiKey by id
const findById = async (key) => {
  try {
    
    const objKey = await apiKeyModel.findOne({ key: key, status: true }).lean();
    return objKey
  } catch (error) {
    console.log('[E]::findApiKeyById::', error);
  }
}

module.exports = {
  findById,
}