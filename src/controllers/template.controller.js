const { CREATED, SuccessReponse } = require('../core/success.response');
const TemplateService = require('../services/template.service');

class TemplateController {
  createTemplate = async (req, res, next) => {
    const { tem_name,
      tem_html, tem_subject } = req.body;
    const template = await TemplateService.newTemplate({
      tem_name,
      tem_html,
      tem_subject
    });
    new CREATED({
      message: 'Template created successfully',
      data: template
    }).send(res);

  }

  getTemplate = async (req, res, next) => {
    const { tem_name } = req.body;
    const template = await TemplateService.getTemplate({ tem_name });
    new SuccessReponse({
      message: 'Template by name',
      data: template
    }).send(res);
  }
}

module.exports = new TemplateController