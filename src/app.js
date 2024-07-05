'use strict';

const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// console.log(process.env);

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init database

// const connectDB =  require('./dbs/init.mongodb.lv0')
// connectDB();
// connectDB();
// connectDB();
require('./dbs/init.mongodb')

// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()


// init routers

const router = require('./routes')

app.use('/',router)


// handle error

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error.message || 'Internal Server Error',
  });
  
});



module.exports = app;