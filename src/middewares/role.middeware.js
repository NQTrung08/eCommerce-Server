
const AccessControl = require('accesscontrol');

// fetch từ collection roles(để chuyển đổi thành một grants object hợp lệ, trong nội bộ)

let grantList = [];

module.exports = new AccessControl(grantList);