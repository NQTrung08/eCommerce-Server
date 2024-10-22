
'use strict';

const { BadRequestError } = require('../core/error.response');
const templateModel = require('../models/template.model')

const newTemplate = async ({
  tem_name,
  tem_html,
  tem_subject
}) => {
    const template = await templateModel.findOne({
      tem_name: tem_name,
    })

    if (template) {
      throw new BadRequestError('Template name already exists');
    }

    const newTemplate = new templateModel({
      tem_name,
      tem_html,
      tem_subject
    });

    await newTemplate.save();

    return newTemplate
}

const getTemplate = async ({
  
}) => {tem_name
    const template = await templateModel.findOne({
      tem_name: tem_name,
    })

    if (!template) {
      throw new BadRequestError('Template not found');
    }
    return template;

}

module.exports = {
  newTemplate,
  getTemplate
};