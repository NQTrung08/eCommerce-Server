const crypto = require('crypto');
const querystring = require('qs');
const { vnpayConfig } = require('../configs/payment.config');
const transactionModel = require('../models/transaction.model');
const { BadRequestError } = require('../core/error.response');
const orderModel = require('../models/order.model');

// Hàm xử lý giao dịch và lưu thông tin giao dịch vào cơ sở dữ liệu
const createVnpayTransaction = async ({
  params
}) => {
  let vnp_Params = params;
  let vnp_SecureHash = vnp_Params['vnp_SecureHash'];

  // Xóa secure hash khỏi tham số để kiểm tra
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sắp xếp lại tham số và tạo chữ ký để kiểm tra tính hợp lệ
  vnp_Params = sortObject(vnp_Params);

  let secretKey = vnpayConfig.vnp_HashSecret;
  let tmnCode = vnpayConfig.vnp_TmnCode
  console.log("secretkey", secretKey);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  console.log("signed", signed);
  console.log("vnp_SecureHash", vnp_SecureHash);

  // Kiểm tra chữ ký có hợp lệ không
  if (signed !== vnp_SecureHash) {
    throw new BadRequestError('Invalid secure hash');
  }
  // Lấy orderIds từ params (giả sử nó được gửi là vnp_TxnRef)

  let responseCode = vnp_Params['vnp_ResponseCode']; // Lấy response code
  let orderStatus;
  if (responseCode === '00') {
    orderStatus = 'paid'; // Thanh toán thành công
  } else {
    // vnp_ResponseCode=24
    orderStatus = 'failed'; // Thanh toán thất bại
  }
  const orderIds = decodeURIComponent(vnp_Params['vnp_TxnRef']).split(',');
  console.log(orderIds);
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

  let createTransactions = [];
  for (const orderId of orderIds) {

    // Tìm order theo orderId và lấy order_total_price
    const order = await orderModel.findById(orderId);

    if (!order) {
      throw new BadRequestError('Order not found'); // Nếu không tìm thấy order, ném lỗi
    }

    const transaction = await transactionModel.create({
      transaction_id: orderId, // Mã giao dịch có thể là mã chung cho tất cả
      order_id: orderId,
      amount: order.order_total_price, // Lưu với đơn vị VND
      bankCode: vnp_Params['vnp_BankCode'],
      transactionNo: vnp_Params['vnp_TransactionNo'],
      responseCode: vnp_Params['vnp_ResponseCode'],
      transactionStatus: vnp_Params['vnp_TransactionStatus'],
    });
    createTransactions.push(transaction);

    console.log('Transaction saved:', transaction);
  }

  return createTransactions;
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
  createVnpayTransaction,
};
