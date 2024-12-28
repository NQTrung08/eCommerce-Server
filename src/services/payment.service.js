// payment.service.js
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const axios = require('axios');

const { vnpayConfig, momoConfig } = require('../configs/payment.config');
const { BadRequestError } = require('../core/error.response');
const orderModel = require('../models/order.model');


// Hàm tạo URL thanh toán VNPAY
const createVnpayPaymentUrl = async ({
  orderIds,
  totalAmount,
  ipAddr
}) => {

  let tmnCode = vnpayConfig.vnp_TmnCode; // Mã TMN của VNPAY
  let secretKey = vnpayConfig.vnp_HashSecret; // Secret key để tạo chữ ký
  let vnpUrl = vnpayConfig.vnp_Url; // URL cổng thanh toán VNPAY
  let returnUrl = vnpayConfig.vnp_ReturnUrl; // URL trả về sau khi thanh toán thành công

  let bankCode = ''; // Có thể để trống nếu không muốn cố định ngân hàng

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss'); // Ngày tạo đơn hàng theo định dạng VNPAY
  const orderId = orderIds.join('-'); // Mã đơn hàng (order ID)
  console.log(orderId);
  const amount = totalAmount; // Tổng giá trị đơn hàng (VND)

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

  // log url
  console.log('VNPAY URL:', vnpUrl);

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


const createMoMoPaymentUrl = async ({ orderIds, amount }) => {
  const requestId = momoConfig.partnerCode + new Date().getTime();
  const redirectUrl = momoConfig.momo_ReturnUrl;
  const ipnUrl = 'https://your-site.com/notify';
  const extraData = "";
  const orderInfo = "Pay with MoMo";
  const requestType = 'payWithMethod';
  const orderId = String(orderIds.join('-')); // Mã đơn hàng (order ID)
  const partnerCode = momoConfig.partnerCode;
  const accessKey = momoConfig.accessKey;
  const secretkey = momoConfig.secretkey;
  const endpoint = momoConfig.endpoint;
  // Tạo chữ ký
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');
  // Tạo request body
  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    orderId,
    amount,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    signature,
    lang: 'vi'
  };

  // Gửi yêu cầu tới MoMo
  const res = await axios.post(endpoint, requestBody, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return res.data; // Trả về kết quả từ MoMo
};

const updateStatusOrders = async (orderId, orderStatus) => {
  const orderIds = decodeURIComponent(orderId).split('-');
  console.log("orderIds", orderIds);
  // Cập nhật trạng thái cho tất cả các đơn hàng
  for (const orderId of orderIds) {
    console.log(orderId);
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { order_status: orderStatus },
      { new: true } // Trả về tài liệu đã cập nhật
    );

    if (!order) {
      throw new BadRequestError('Order not found');
    }
  }
}


module.exports = {
  createVnpayPaymentUrl,
  createMoMoPaymentUrl,
  updateStatusOrders
}