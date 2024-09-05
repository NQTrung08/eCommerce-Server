const app = require("./src/app");
const { app: {port}} = require('./src/configs/config.app');
const { app: {url}} = require('./src/configs/config.app');
// const PORT = process.env.PORT || 3306;
 
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Api docs is running on ${url}/v1/api/api-docs`);
});

console.log(`Starting`);

// process.on("SIGINT", () => {
//   server.close(() => {
//     console.log("Server is closed");
//   })
// })