import express, { Express, Request, Response } from "express";
import cors from "cors";
import { limiter } from "../middlewares";
import { ALLOWED_ORIGINS } from "../constants/constant";

export const configureExpress = async (app: Express) => {
  // Trust proxy
  app.set('trust proxy', 1);

  // CORS configuration with dynamic origin check
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Allow local network IPs for React Native development
      // Matches patterns like: http://192.168.x.x:port, http://10.x.x.x:port, http://172.16-31.x.x:port
      const localNetworkPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
      
      if (localNetworkPattern.test(origin)) {
        return callback(null, true);
      }

      // Reject other origins
      callback(new Error('Not allowed by CORS'));
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
  // await createSocketServer();

  // Health check route
  app.get("/", (req: Request, res: Response) => {
    res.send("API is running 🚀");
  });

  // // Global error handlers (must be last)
  // app.use(notFoundHandler);
  // app.use(errorHandler);

  // // Global unhandled promise rejection handler
  // process.on('unhandledRejection', handleUnhandledRejection);
  
  // // Global uncaught exception handler
  // process.on('uncaughtException', handleUncaughtException);

  return { app };
};

