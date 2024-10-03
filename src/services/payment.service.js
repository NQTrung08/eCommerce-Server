// payment.service.js
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

const { vnpayConfig } = require('../configs/payment.config')


// Hàm tạo URL thanh toán VNPAY
const createVnpayPaymentUrl = async (order, ipAddr) => {
  console.log('order', order);

  let tmnCode = vnpayConfig.vnp_TmnCode; // Mã TMN của VNPAY
  let secretKey = vnpayConfig.vnp_HashSecret; // Secret key để tạo chữ ký
  let vnpUrl = vnpayConfig.vnp_Url; // URL cổng thanh toán VNPAY
  let returnUrl = vnpayConfig.vnp_ReturnUrl; // URL trả về sau khi thanh toán thành công

  let bankCode = ''; // Có thể để trống nếu không muốn cố định ngân hàng

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss'); // Ngày tạo đơn hàng theo định dạng VNPAY
  const orderId = order._id.toString(); // Mã đơn hàng (order ID)
  const amount = order.order_total_price; // Tổng giá trị đơn hàng (VND)

  let vnpParams = {}; // Đối tượng chứa các tham số gửi đến VNPAY
  vnpParams['vnp_Version'] = '2.1.0';
  vnpParams['vnp_Command'] = 'pay';
  vnpParams['vnp_TmnCode'] = tmnCode;
  vnpParams['vnp_Amount'] = amount * 100; // Giá trị đơn hàng nhân với 100 (đơn vị của VNPAY là đồng)
  vnpParams['vnp_CurrCode'] = 'VND'; // Đơn vị tiền tệ
  vnpParams['vnp_TxnRef'] = orderId; // Mã giao dịch tham chiếu
  vnpParams['vnp_OrderInfo'] = `Payment for order ${orderId}`; // Thông tin đơn hàng
  vnpParams['vnp_OrderType'] = 'other'; // Loại đơn hàng
  vnpParams['vnp_Locale'] = 'vn'; // Ngôn ngữ (VN hoặc EN)
  vnpParams['vnp_ReturnUrl'] = returnUrl; // URL trả về sau khi thanh toán
  vnpParams['vnp_IpAddr'] = ipAddr; // Địa chỉ IP của người dùng
  vnpParams['vnp_CreateDate'] = createDate; // Ngày tạo giao dịch

  // Nếu có bankCode thì truyền vào tham số
  if (bankCode !== '') {
    vnpParams['vnp_BankCode'] = bankCode;
  }

  // Sắp xếp lại các tham số
  vnpParams = sortObject(vnpParams);

  // Tạo chuỗi ký tự để mã hóa
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey); // Tạo chữ ký HMAC với secretKey
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  vnpParams['vnp_SecureHash'] = signed; // Thêm chữ ký vào tham số
  vnpUrl += '?' + querystring.stringify(vnpParams, { encode: false });
  return vnpUrl;
};


function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = {
  createVnpayPaymentUrl,
};
