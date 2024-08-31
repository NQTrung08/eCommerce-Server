const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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
    path.join(__dirname, '../routes/**/*.js'), // This path should match your route files
  ],
};

console.log(options.apis)

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
