import express from "express";
import mongoose from "mongoose";
import serverless from "serverless-http";

const app = express();
const port = process.env.PORT || 3001;

// Middleware để đảm bảo Express nhận được các yêu cầu JSON

// Route /hi
app.get("/hi", (req, res) => {
  res.send("Hiiiiiiiiiiiiiii");
});

// Kết nối MongoDB
app.use("/.netlify/functions/server", app);

// Khởi tạo serverless handler
export const handler = serverless(app);
