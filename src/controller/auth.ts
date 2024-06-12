import { addUser, getDataUser } from "../services/auth";
import { comparePassWord, passwordHash } from "../services/security";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import Auth from "../module/auth";

export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const getuser = await getDataUser({ email: email }); //tìm lấy ra cái thằng email
    if (getuser) {
      return res.status(200).json({
        success: false,
        message: "Tài khoản đã tồn tại",
      });
    }
    // mã hóa mật khẩu
    var hashPw = passwordHash(password);
    const newUser = {
      username: username,
      email: email,
      password: hashPw,
      role: role,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Xác nhận đăng ký tài khoản!",
      text: `Xin chào,

      Chúc mừng! Tài khoản của bạn đã được xác nhận thành công. Bây giờ bạn có thể trải nghiệm ứng dụng của chúng tôi và tham gia vào cộng đồng.

      Ứng dụng của chúng tôi cung cấp nhiều tính năng thú vị, bao gồm:
      - Xem phim miễn phí trên nền tảng của chúng tôi.
      - Tham gia và chia sẻ ý kiến trong các nhóm thảo luận về phim tại: [đây](https://www.facebook.com/profile.php?id=61556232330775).
      - Tương tác với cộng đồng bằng cách bình luận và đánh giá phim yêu thích của bạn tại: [đây](https://www.tiktok.com/@tieu_loli).
      - Nhận thông báo về các bộ phim mới, sự kiện đặc biệt và ưu đãi hấp dẫn tại: [đây](https://www.facebook.com/profile.php?id=61556232330775).

      Hãy truy cập ứng dụng ngay bây giờ và bắt đầu tu tiên thôi nào các đạo hữu, GET GO.

      Chúng tôi rất mong được phục vụ bạn và hy vọng bạn có thời gian thú vị khi sử dụng ứng dụng.

      Trân trọng,
      Đội ngũ ứng dụng của chúng tôi`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    await addUser(newUser);
    return res.status(200).json({
      success: true,
      message: "Thành công",
      newUser: [newUser],
    });
  } catch (error) {
    return res.json({
      message: "Đăng kí không thành công!",
      success: false,
    });
  }
};

export const singin = async (req, res) => {
  try {
    const { password, username } = req.body;
    const getUserLogin = await getDataUser({ username: username });
    if (!getUserLogin) {
      return res.status(200).json({
        success: false,
        message: "Tài khoản không tồn tại",
        code: 401,
      });
    }

    const comparePw = comparePassWord(password, getUserLogin.password);
    if (!comparePw) {
      return res.status(200).json({
        success: false,
        message: "Sai thông tin đăng nhập",
        code: 400,
      });
    }
    const user = {
      _id: getUserLogin._id,
      username: getUserLogin.username,
      // email: getUserLogin.email,
      role: getUserLogin.role,
      cart: getUserLogin.cart,
      image: getUserLogin.image,
    };
    const tokenAuth = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: "10h",
    });
    const refreshTokenAuth = jwt.sign(user, process.env.REFRESH_TOKEN_KEY, {
      expiresIn: "30d",
    });
    req.session = user;
    return res.status(200).json({
      code: 200,
      success: true,
      token: tokenAuth,
      message: "Đăng nhập thành công!",
      user: user,
      refreshToken: refreshTokenAuth,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: "Đăng nhập không thành công!",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token empty!" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decode) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Token!" });
      }
      const user = {
        _id: decode._id,
        username: decode.username,
        email: decode.email,
        role: decode.role,
        cart: decode.cart,
        image: decode.image,
      };
      const newAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "24h",
      });
      return res.json({
        code: 200,
        success: true,
        token: newAccessToken,
        message: "Đăng nhập thành công!",
        user: user,
        refreshToken: refreshToken,
      });
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: error.message,
    });
  }
};

export const getAuth = async (req, res, next, id) => {
  try {
    const user = await Auth.findById(id).exec();
    if (!user) {
      res.status(400).json({
        message: "Khong tim thay user",
      });
    }
    req.profile = user;
    req.profile.password = undefined;
    next();
  } catch (error) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user: any = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json("We cant not find user!");
    }

    const token = jwt.sign({ email }, process.env.SECERT_JWT_KEY, {
      expiresIn: "1h",
    });
    const link = `${process.env.FE_DEPLOYMENT}/reset-password/${user._id}/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Thay đổi mật khẩu mới!",
      text: `Chào bạn,\r\n\r\nChúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng liên kết dưới đây để thay đổi mật khẩu:\r\n\r\nUrl: ${link}\r\n\r\nHãy sử dụng mã xác nhận này trong quá trình xác thực tài khoản của bạn. Nếu bạn không yêu cầu mã này, xin vui lòng bỏ qua email này.\r\n\r\nTrân trọng,\r\nĐội ngũ của chúng tôi!`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return res.status(200).json({
      code: 200,
      success: true,
      message: "Vui lòng kiểm tra lại email của bạn!",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const user = await Auth.findById(id);
    const { password } = req.body;
    if (!user) {
      return res.status(404).json("We cant not find user!");
    }
    jwt.verify(token, process.env.SECERT_JWT_KEY);
    var newPassword = passwordHash(password);
    await Auth.findByIdAndUpdate(id, {
      $set: { password: newPassword },
    });
    return res.status(200).json({
      code: 200,
      success: true,
      message: "Reset password success!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
