import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import comments from "../module/comments";
export const requiredSignin = expressjwt({
  algorithms: ["HS256"],
  secret: "nampg",
  requestProperty: "auth",
});

export const isAuth = (req, res, next) => {
  const status = req.profile._id == req.auth._id;
  if (!status) {
    return res.status(401).json({
      message: "Ban khong co quyen truy cap",
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.auth.role == 0) {
    return res.status(401).json({
      message: "Ban khong phai la admin...",
    });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.auth.role == 1) {
    return res.status(401).json({
      message: "Ban khong phai la Admin Pro...",
    });
  }
  next();
};

export const checkToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Kiểm tra xem token đã được gửi lên hay chưa
  if (!token) {
    return res.status(401).json({
      message: "Không được phép",
    });
  }
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY,(err,decode)=>{
      console.log("1");
    });
    req.user = payload; 
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token không hợp lệ", code: 401 });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token hết hạn" });
    }
    return res.status(500).json({ message: "Lỗi máy chủ" }); 
  }
};
