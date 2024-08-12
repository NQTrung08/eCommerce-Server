'use strict';

const multer = require('multer');


const uploadMemory = multer({
  storage: multer.memoryStorage()
})

const uploadStorage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/uploads/'); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Đặt tên file với timestamp
    }
  })
});

module.exports = {
  uploadMemory,
  uploadStorage,
}