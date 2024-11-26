const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/api/products", (req, res) => {
    res.json({ message: "Hello from Node.js on Netlify!" });
});

module.exports.handler = serverless(app);