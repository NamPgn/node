import express, { Express, Request, Response } from "express";
import cors from "cors";
import { limiter } from "../middlewares";
import { ALLOWED_ORIGINS } from "../constants/constant";


export const configureExpress = (app: Express) => {
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Body parser
  app.use(express.json());

  // Rate limiter
  app.use(limiter);

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

  // Health check route
  app.get("/", (req: Request, res: Response) => {
    res.send("API is running 🚀");
  });
}; 

