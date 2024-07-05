'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

const _SECONDS = 5000;

// countConnect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Current connections: ${numConnection}`);
}

// check Overload

const checkOverload = () => {
  setInterval(() => {

    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    const maxConnections = numCores * 5;

    console.log(`Active connections: ${numConnection}`);
    console.log(`Memory Usage: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnections) {
      console.error(`Overload detected. Connection count: ${numConnection}, Memory usage: ${memoryUsage} bytes`);
      // Restart server
    }


  }, _SECONDS); // Monitor
}

module.exports = {
  countConnect,
  checkOverload
};