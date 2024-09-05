const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { app: {url}} = require('../configs/config.app');
const path = require('path');

// Cấu hình Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation for your Node.js application',
  },
  servers: [
    {
      url: `${url}/v1/api`, // URL của server
    },
  ],
};

// Cấu hình Swagger UI
const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../api-docs/*.yaml'), // Đọc tất cả các tệp YAML trong thư mục docs
  ],
};
const swaggerSpec = swaggerJSDoc(options);



module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

