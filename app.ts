import express, { Express, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import routerAuth from "./src/routes/auth";
import routerProducts from "./src/routes/products";
import routerCategory from "./src/routes/category";
import routerTrailer from "./src/routes/trailer.home";
import routerComments from "./src/routes/comment";
import admin from "firebase-admin";
import routerCart from "./src/routes/cart";
import routerTypes from "./src/routes/types";
import routerCategorymain from "./src/routes/categorymain";
import routerImage from "./src/routes/image.user";
import routerWeek from "./src/routes/week.category";
import routerApprove from "./src/routes/approve";
import routerBanner from "./src/routes/banner";
import routerSeason from "./src/routes/season";
import routerReport from "./src/routes/report";
import { limiter } from "./src/config/limitter";
const port = process.env.PORT;
const serviceAccount: any = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};
const routers = [
  routerAuth,
  routerProducts,
  routerCategory,
  routerTrailer,
  routerComments,
  routerCart,
  routerTypes,
  routerCategorymain,
  routerWeek,
  routerImage,
  routerApprove,
  routerBanner,
  routerSeason,
  routerReport
];

const allowedOrigins = [
  'https://hhhihi.site',
  'https://tromphim.site',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://67fa56cbf31fa30008ccc997--testmoviee.netlify.app/'
];

const app: Express = express();
app.set("trust proxy", 1);
// const limiter = require("express-limiter")(app);
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(limiter);
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// limiter({
//   path: "/",
//   method: "post",
//   lookup: ["connection.remoteAddress"],
//   total: 50, // Số lượng yêu cầu tối đa trong một khoảng thời gian
//   expire: 1000 * 60 * 60, // 1 giờ
//   message: "Quá nhiều yêu cầu, vui lòng thử lại sau một giờ.",
// });

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

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.STORAGE_BUCKET,
  });
}

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
