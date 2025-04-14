import express, { Express, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { limiter } from "../middlewares";
import { ALLOWED_ORIGINS } from "../constants/constant";
import { createSocketServer } from "./socket-server";

export const configureExpress = async (app: Express) => {
  // Trust proxy
  app.set('trust proxy', true);

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Cho phép tất cả origin trong development
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
        return;
      }

      // Kiểm tra origin trong production
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiter
  app.use(limiter);


  // Initialize Socket.IO server
  await createSocketServer();

  // Health check route
  app.get("/", (req: Request, res: Response) => {
    res.send("API is running 🚀");
  });

  return { app };
};

