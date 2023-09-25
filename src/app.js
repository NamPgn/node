import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import routerAuth from "./routes/auth";
import routerProducts from "./routes/products.js";
import routerCategory from "./routes/category.js";
import routerPostList from "./routes/post.js";
import routerTrailer from "./routes/trailer.home";
import routerComments from "./routes/comment.js";
import admin from "firebase-admin";
import routerCart from "./routes/cart.js";
import routerTypes from "./routes/types.js";
import routerCategorymain from "./routes/categorymain.js";
import routerImage from './routes/image.user'
import serviceAccount from "../public/path/mystorage-265d8-firebase-adminsdk-4jj90-9c56ceaf71.json";
import routerWeek from "./routes/week.category";
const port = process.env.PORT || 3000;

const routers = [
  routerAuth,
  routerProducts,
  routerCategory,
  routerPostList,
  routerTrailer,
  routerComments,
  routerCart,
  routerTypes,
  routerCategorymain,
  routerWeek,
  routerImage
];

const app = express();
const limiter = require('express-limiter')(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Thiết lập giới hạn yêu cầu cho tất cả các route
limiter({
  path: '/',
  method: 'post',
  lookup: ['connection.remoteAddress'],
  total: 50, // Số lượng yêu cầu tối đa trong một khoảng thời gian
  expire: 1000 * 60 * 60, // 1 giờ
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau một giờ.'
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tromphim.netlify.app');
  next();
});

app.use(cors());
routers.map((router) => app.use("/api", router));

app.get("/", (req, res) => {
  res.send("Đmm");
});

try {
  mongoose.connect(`${process.env.URI}`);
  console.log("Kết nôt mongodb thành công");
} catch (error) {
  console.log("lỗi rồi");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

app.listen(port, async () => {
  console.log(`Server is running on: http://localhost:${port}`);
});


const key = 'my-secret-key';
// const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
console.log(key);
// const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
// const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

//https://accounts.google.com/o/oauth2/token?scope=https://www.googleapis.com/auth/drive&client_id=949752774575-9bh3rqk5j6ntflgkikluk7jhd8kiihfi.apps.googleusercontent.com&redirect_uri=http://localhost:8000&response_type=code&access_type=offline
//https://accounts.google.com/o/oauth2/token?code