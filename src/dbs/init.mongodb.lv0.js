const mongoose = require('mongoose');

let connectionCount = 0;

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shopDEV', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Đăng ký sự kiện 'open' để log số lần kết nối
    mongoose.connection.on('open', () => {
      connectionCount++;
      console.log(`FRESHER MongoDB is connected. Connection count: ${connectionCount}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;