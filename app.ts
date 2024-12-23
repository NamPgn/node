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
const port = process.env.PORT;
const serviceAccount: any = {
  type: "service_account",
  project_id: "mystorage-265d8",
  private_key_id: "9c56ceaf7166cdba3c40321a82337f5a4a59bfb0",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDhvPNzq2cPMJFP\nkS4zirpQL+AcewOUOTWR0xX8NRcKyGmvwoU7lQjU4RwbXvTfF5NdnhE/Ed5YHBXx\ne44h02QXNO6EKEZL9TC9vPHTfPsv2+jo9lpdzCtdNkleSrkpTGEKZt6NS967+oUW\nEKpLPyWiKo5YkLLTQ0GqQp2ULQbGBQ/SpFYrIwWhIu4Lyuig5KNTbneW6UnkwIId\nbGcLb+net2ylt5+3aiW8O0w5LeoIXs1X23w594aKUBnvoMqlQ84E+Z/1b9EunKqh\nmOQ+6gC1augcvIaTnEdVZbEVp0sN4hAEKzlj4sZ6zz3chXYj3nZX5eQBtF2RG2cB\nXpaHEHoDAgMBAAECggEAIIj2Nwv+N5noElAPbk2msBtRBr8oHeXnoFPhzaRCj5hL\nuzxNrZpmV8r2HRp2L+1FnRmaIhKg5Dwatt+i9aHHwZyBwA8kn+//4r49Gx6JVDWI\nKoN533OnewYcVE3FcCavrysdFRUD+OiQ4+7qTHFr1Xqit4XAxbg3hPhC8/H6vEaw\nhQGV3EkWK9POvwBOFFSNLFkRvwmzZDD6entQyl8QMmJeNcTfOre8nLsQTYJcONAF\nzOdVVjvACrqg+j6F2bPaFrspzw26At6GGDGaMaIubvqsogyqJB9qx5yJ49zSEmdT\n7X/k/tl7QXA0Z6SEqt2CxOEWZyuykQE8kqXqUmNjqQKBgQD0J3nvpLOrBQoj9XKN\nvePGkL6MNruAO6akxWlkfFAu9qJAFABkVnPdPrU9Ca+A/fGOSzflbNSTY1jzgNo1\n5dQK3xY5G964gvQ3qKlo4c3Latz4Gj+EgqCHFuVVxT5ljqGqo4UZdeReb4LUvX12\n2Ix/SGeXw53vemWvqlomPO0H1wKBgQDssLyhZR5Zw0vl4aXPudX5BZ+cO94c+ea4\n7H5BU9+CWZAoWLechliepSf3zsiYyAmQsVh2u53zdJYmT0c5c6zpMWZkFq1adX4y\njsZP2VZZmFOIjKOdYLQV/Hr8YbV7A8oVzPRv6mvhDKQgkDHcrJFU0KyG3fPoornd\ngNBk03uptQKBgD6BZLwvRDgCQEhYbA1RkeCh6cZntLTtkIoaaBLrqHN9fKg+9qK5\nZ0w645dOxXmWiaLOKu83X2ykQH+Ge1bVEeX+muff9LL0A6XELirFtDPhldSGk8BO\n2N38xJWiu4iwbT8MQeT0w5RRpALmyBoG8mEbnjnCQMqwYRwJ1q53Zo9dAoGAMPRh\nH3SdsW0uXo6sT+mc8xORrqvHRfD+IpNvja1+ViSWJ3IqD+rNm4qHWL7hSJBfQhkc\nNfqaMceUYroU/jIJunWoOt1h34rbnjNfmxZVwNQ7ustz79IXjVCaU2cWNSpUeuvY\nRumShIqry7xnQ8BBkuxSMtbnYt99V+4TrDb9pd0CgYEA6xRL+if/2Q/sYmZZQM2T\n6dLmAanuJGC00k9KljWBZDpOCAD5OFQ9bcjeF7vqGuGu04+r7XqXnDCGvcD6PeqN\nqgIjfF8AFIOAR1PLr05eTBw/Tzmg7GZCwJHgsn3bLLuk5gWd/7tNb0sZUztK60rI\nRtk6n6jqbibNlMj3+bv30pU=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-4jj90@mystorage-265d8.iam.gserviceaccount.com",
  client_id: "117849691487922239697",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4jj90%40mystorage-265d8.iam.gserviceaccount.com",
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
];
const app: Express = express();
const limiter = require("express-limiter")(app);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, res: Response, next) => {
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
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
