const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { app: { url } } = require('../configs/config.app');
const path = require('path');

// Cấu hình Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: `API documentation for your Node.js application.
    
    **Token access**: 
    \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmFmNGM2OTk5YWYwZjAyMDhhMjNkMTgiLCJ1c2VyTmFtZSI6ImE0MTk1NCIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4cmt3bWlycy9pbWFnZS91cGxvYWQvdjE3MjM2NTIyNjYvdXNlcnMvNjZhZjRjNjk5OWFmMGYwMjA4YTIzZDE4L2F2YXRhci82NmFmNGM2OTk5YWYwZjAyMDhhMjNkMTgtYXZhdGFyLmpwZyIsInBob25lTnVtYmVyIjoiMDM5OTY2NzczOCIsImVtYWlsIjoiYTQxOTU0QGdtYWlsLmNvbSIsInJvbGVzIjpbIjY2YWI1ZGVmM2FmMmFlZWEwMDYxNzQwNyIsIjY2YjM5NTJkYjNmZjdiZTEwYjVkNjYxOSIsIjY2YWI2MWNlYWZmZmNjZmJiNWFhZjQzZCJdLCJyb2xlTmFtZXMiOlsiYWRtaW4iLCJ1c2VyIiwic2hvcCJdLCJzdGF0dXMiOiJhY3RpdmUiLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJpYXQiOjE3MjgwOTgxMDQsImV4cCI6MTcyODM1NzMwNH0.JbYZI0tlKEqfiUH0mEfeum-rRUOz76zXJBmoJcPzCS8\`
    `,
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

