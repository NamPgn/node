import { addUser, getDataUser } from "../services/auth";
import { generateToken } from "../services/requestToken";
import { comparePassWord, passwordHash } from "../services/security";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import Auth from "../module/auth";

export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // const { filename } = req.file;
    // filename ? filename : "https://taytou.com/wp-content/uploads/2022/08/Tai-anh-dai-dien-cute-de-thuong-hinh-meo-nen-xanh-la.png";

    // console.log("req.file", filename)

    const getuser = await getDataUser({ email: email }); //tìm lấy ra cái thằng email
    if (getuser) {
      //kiểm tra nếu mà nó đã tồn tại thì trả về cái lỗi
      return res.status(401).json({
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
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
        code: 401,
      });
    }

    const comparePw = comparePassWord(password, getUserLogin.password);
    if (!comparePw) {
      return res.status(400).json({
        success: false,
        message: "Nhập lại mật khẩu đi",
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
    const tokenAuth = generateToken(user);
    req.session = user;
    // send mail with defined transport object

    // const mailOptions = {
    //     from: `${process.env.EMAIL}`,
    //     to: `${email}`,
    //     subject: 'Nam chào bạn',
    //     text: 'This is a test email from Node.js'
    // };
    // sendMail(mailOptions);

    return res.status(200).json({
      code: 200,
      success: true,
      token: tokenAuth,
      message: "Đăng nhập thành công!",
      user: user,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: "Đăng nhập không thành công!",
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
      message: "Đăng nhập không thành công!",
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
    const link = `${process.env.BACKEND_DEPLOYMENT}/reset-password/${user._id}/${token}`;

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
