'use strict';

const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
require('./auth/googleAuth')

const app = express();

// app.use(session({
//   secret: 'your-session-secret', // Thay đổi thành secret của bạn
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } // Sử dụng `true` nếu bạn sử dụng HTTPS
// }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// init middleware

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


// Middleware cho Passport
app.use(passport.initialize());
// app.use(passport.session());

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
    stack: error.stack,
    message: error.message || 'Internal Server Error',
  });
  
});



module.exports = app;