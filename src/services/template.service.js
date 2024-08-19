
'use strict';

const { BadRequestError } = require('../core/error.response');
const templateModel = require('../models/template.model')

const newTemplate = async ({
  tem_name,
}) => {
  try {

    const template = await templateModel.findOne({
      tem_name: tem_name,
    })

    if (template) {
      throw new BadRequestError('Template name already exists');
    }

    const newTemplate = new templateModel({
      tem_name,
      tem_html,
    });

    return newTemplate

  } catch (error) {
    console.log('[E]::newTemplate::', error);
    throw error;
  }
}

const getTemplate = async ({
  tem_name
}) => {
  try {
    const template = await templateModel.findOne({
      tem_name: tem_name,
    })

    if (!template) {
      throw new BadRequestError('Template not found');
    }
    return template;

  } catch (error) {
    console.log('[E]::getTemplate::', error);
    throw error;
  }
}

module.exports = {
  newTemplate,
  getTemplate
};