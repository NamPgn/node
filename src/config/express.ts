import express, { Express, Request, Response } from "express";
import cors from "cors";
import { limiter } from "../middlewares";
import { ALLOWED_ORIGINS } from "../constants/constant";

export const configureExpress = async (app: Express) => {
  // Trust proxy
  app.set('trust proxy', 1);

  // CORS configuration
  app.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
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

