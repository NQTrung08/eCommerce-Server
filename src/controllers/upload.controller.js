const { SuccessReponse } = require("../core/success.response");
const uploadService = require('../services/upload.service')

const uploadFile = async (req, res, next) => {
    new SuccessReponse({
      message: "File uploaded successfully",
      data: await uploadService.uploadImageFromUrl()
    }).send(res)
};

module.exports = {
    uploadFile
}