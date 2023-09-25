// const rateLimit = require("express-rate-limit");

// const createAccountLimiter = (limit) => {
//   return rateLimit({
//     windowMs: 60 * 60 * 1000, // Khoảng thời gian giới hạn (ví dụ: 1 giờ)
//     max: limit, // Số lượng yêu cầu tối đa trong khoảng thời gian (ví dụ: 5)
//     message:
//       "Quá nhiều tài khoản được tạo từ IP này, vui lòng thử lại sau một giờ.",
//     headers: false, // Tắt các header mặc định (X-RateLimit-* headers)
//   });
// };

// export default createAccountLimiter;
