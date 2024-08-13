'use strict'

const mongoose = require('mongoose');
const productModel = require('../models/product.model');
const { db: { host, port, name } } = require('../configs/config.mongodb');

const mongoConnectString = `mongodb://${host}:${port}/${name}`
console.log(mongoConnectString);
const mysqlConfig = {
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'shopDEV'
}

const { countConnect } = require('../helpers/check.connect');

class Database {

  constructor(type = 'mongodb') {
    this.connect(type)
  }

  connect(type) {
    if (type === 'mongodb') {
      mongoose.connect(mongoConnectString, {
        autoIndex: false,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
      })
        .then(() => {
          console.log('MongoDB is connected')

          countConnect();
          // Tạo chỉ mục cho tất cả các mô hình nếu cần
          productModel.createIndexes()
            .then(() => {
              console.log('Product Indexes created successfully');
            })
            .catch((err) => {
              console.error('Error creating indexes:', err);
            });


        })
        .catch((err) => {
          console.log(err)
        })
    } else if (type === 'mysql') {
      const mysql = require('mysql');
      const connection = mysql.createConnection(mysqlConfig);

      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to MySQL database: ' + err.stack);
          return;
        }
        console.log('MySQL database connected as id ' + connection.threadId);
      });

      connection.end();
    } else {
      console.error('Unsupported database type: ' + type);
    }
  }

  static getInstance(type) {
    if (!Database.instance) {
      Database.instance = new Database(type);
    }
    return Database.instance;
  }
}

const instance = Database.getInstance('mongodb'); // Thay 'mongodb' thành 'mysql' nếu bạn muốn kết nối tới MySQL

module.exports = instance;
