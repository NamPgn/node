import { addUser, getDataUser } from "../services/auth";
import { generateToken } from "../services/requestToken";
import { comparePassWord, passwordHash } from "../services/security";
import Auth from "../module/auth";

export const signup = async (req, res) => {
    try {
        const { username, email, password, role, image } = req.body;
        // const { filename } = req.file;
        // filename ? filename : "https://taytou.com/wp-content/uploads/2022/08/Tai-anh-dai-dien-cute-de-thuong-hinh-meo-nen-xanh-la.png";

        // console.log("req.file", filename)

        const getuser = await getDataUser({ username: username }); //tìm lấy ra cái thằng email
        if (getuser) { //kiểm tra nếu mà nó email đã tồn tại thì trả về cái lỗi
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã tồn tại'
            })
        }
        // mã hóa mật khẩu
        var hashPw = passwordHash(password);
        const newUser = {
            username: username,
            // email: email,
            password: hashPw,
            // image: image,
            // image: `http://localhost:${process.env.PORT}/images/` + filename,
            role: role
        }
        await addUser(newUser)
        return res.status(200).json({
            success: true,
            message: "Thành công",
            newUser: [newUser]
        })
    } catch (error) {
        return res.json({
            message: "Đăng kí không thành công!",
            success: false,
        })
    }
}

export const singin = async (req, res) => {
    try {
        const { password, username } = req.body;
        const getUserLogin = await getDataUser({ username: username })
        if (!getUserLogin) {
            return res.status(401).json(
                {
                    success: false,
                    message: 'Tài khoản không tồn tại',
                    code: 401
                }
            )
        }

        const comparePw = comparePassWord(password, getUserLogin.password);
        if (!comparePw) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'Nhập lại mật khẩu đi',
                    code: 400
                }
            )
        }
        const user = {
            _id: getUserLogin._id,
            username: getUserLogin.username,
            // email: getUserLogin.email,
            role: getUserLogin.role,
            cart: getUserLogin.cart,
            image: getUserLogin.image
        }
        const tokenAuth = generateToken(user)
        req.session = user
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
            user: user
        })
    } catch (error) {
        res.status(400).json({
            code: 400,
            success: false,
            message: "Đăng nhập không thành công!",
        })
    }
}
export const getAuth = async (req, res, next, id) => {
    try {
        const user = await Auth.findById(id).exec();
        if (!user) {
            res.status(400).json({
                message: "Khong tim thay user"
            })
        }
        req.profile = user
        req.profile.password = undefined;
        next();
    } catch (error) {
        console.log(error)
    }
}

