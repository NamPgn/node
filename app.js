import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import routerAuth from "./src/routes/auth.js";
import routerProducts from "./src/routes/products.js";
import routerCategory from "./src/routes/category.js";
import routerPostList from "./src/routes/post.js";
import routerTrailer from "./src/routes/trailer.home.js";
import routerComments from "./src/routes/comment.js";
import admin from "firebase-admin";
import routerCart from "./src/routes/cart.js";
import routerTypes from "./src/routes/types.js";
import routerCategorymain from "./src/routes/categorymain.js";
import routerImage from "./src/routes/image.user.js";
import serviceAccount from "./public/path/mystorage-265d8-firebase-adminsdk-4jj90-9c56ceaf71.json";
import routerWeek from "./src/routes/week.category.js";
import routerApprove from "./src/routes/approve.js";
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
  routerImage,
  routerApprove,
];

const app = express();
const limiter = require("express-limiter")(app);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://tromphim.netlify.app");
  next();
});

app.use(cors());
limiter({
  path: "/",
  method: "post",
  lookup: ["connection.remoteAddress"],
  total: 50, // Số lượng yêu cầu tối đa trong một khoảng thời gian
  expire: 1000 * 60 * 60, // 1 giờ
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau một giờ.",
});

routers.map((router) => app.use("/api", router));

app.get("/", (req, res) => {
  res.send("Hiiiiiiiiiiiiiii");
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
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
// const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
// const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

//https://accounts.google.com/o/oauth2/token?scope=https://www.googleapis.com/auth/drive&client_id=949752774575-9bh3rqk5j6ntflgkikluk7jhd8kiihfi.apps.googleusercontent.com&redirect_uri=http://localhost:8000&response_type=code&access_type=offline
//https://accounts.google.com/o/oauth2/token?code
