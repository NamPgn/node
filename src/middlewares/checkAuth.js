import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
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
  if (req.auth.role == 1) {
    return res.status(401).json({
      message: "Ban khong phai la admin...cuts",
    });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.auth.role == 2) {
    return res.status(401).json({
      message: "Ban khong phai la Admin Pro...cuts",
    });
  }
  next();
};

export const checkToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!req.headers.authorization) {
    //check nếu k có token gửi lên
    return res.status(401).json({
      message: "Không được phép",
    });
  }
  jwt.verify(token, process.env.MK, async (error, payload) => {
    if (error) {
      if (error.name == "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Token không hợp lệ", code: 401 });
      }
      if (error.name == "TokenExpiredError") {
        return res.status(401).json({
          message: "Token hết hạn",
        });
      }
    }
    // const User = await Auth.findById(payload._id);
    // if (!User) return res.status(401).json({ message: "Unauthorized" });
    // if (User.role !== 1) return res.status(401).json({ message: "Bạn k có quyền!" });
    // req.user = User;
    next();
  });
};
