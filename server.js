const app = require("./src/app");
const { app: {port}} = require('./src/configs/config.app');
// const PORT = process.env.PORT || 3306;
 
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log(`Starting`);

// process.on("SIGINT", () => {
//   server.close(() => {
//     console.log("Server is closed");
//   })
// })