const { SuccessReponse } = require('../core/success.response');
const crypto = require('crypto');
const querystring = require('qs');
const { vnpayConfig, momoConfig } = require('../configs/payment.config');
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
  let orderStatus = 'pending';
  if (responseCode == '00') {
    orderStatus = 'waiting'; // Thanh toán thành công
  }
  const orderIds = decodeURIComponent(vnp_Params['vnp_TxnRef']).split('-');
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
      accountName: vnp_Params['vnp_AccountName'], // Tên chủ tài khoản
      accountNumber: vnp_Params['vnp_AccountNumber'], // Số tài khoản ngân hàng
      bankLogo: vnp_Params['vnp_BankLogo'],
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

const verifySignature = async (params) => {

  console.log("params", params);
  // Lấy signature từ tham số
  const receivedSignature = params['signature'];

  // Loại bỏ tham số signature ra khỏi params
  delete params['signature'];

  // Sắp xếp tham số theo thứ tự bảng chữ cái
  const sortedParams = sortObject(params);

  // Tạo chuỗi signData
  const signData = querystring.stringify(sortedParams, { encode: false });

  let hmac = crypto.createHmac("sha512", momoConfig.secretkey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  console.log('signData:', signData);
  console.log('generatedSignature:', signed);
  console.log('receivedSignature:', receivedSignature);

  // So sánh chữ ký
  // if (signed !== receivedSignature) {
  //   throw new BadRequestError('Invalid signature');
  // }

  return true;
}

const createMoMoTransaction = async ({
  transactionId,
  orderId,
  amount,
  bankCode = '',
  transactionNo = '',
  responseCode,
  transactionStatus = 'PENDING',
}) => {

  const orderIds = decodeURIComponent(orderId).split('-');

  let createTransactions = [];
  for (const orderId of orderIds) {

    // Tìm order theo orderId và lấy order_total_price
    const order = await orderModel.findById(orderId);

    if (!order) {
      throw new BadRequestError('Order not found'); // Nếu không tìm thấy order, ném lỗi
    }
    // Tạo bản ghi giao dịch mới
    const transaction = await transactionModel.create({
      transaction_id: transactionId,
      order_id: orderId,
      amount: order.order_total_price,
      bankCode,
      transactionNo: transactionId,
      responseCode,
      transactionStatus,
    });

    createTransactions.push(transaction);

  }

  return {
    status: 200,
    data: createTransactions,
    message: 'Transaction created successfully',
  };
};


const getTransactions = async () => {
  const transactions = await transactionModel.find()

  return transactions
}

const getTransactionsByShopId = async ({
  shopId
}) => {
  const transactions = await transactionModel.find({
    order_id: {
      $in: await orderModel.find({
        order_shopId: shopId
      }).map(order => order._id)
    }
  })

  return transactions
}



module.exports = {
  createVnpayTransaction,
  createMoMoTransaction,
  getTransactions,
  getTransactionsByShopId,
  verifySignature
};
