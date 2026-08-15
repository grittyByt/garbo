/*
* This will allow the frontend to:
* 	•	fetch("/api/auth/signup", ...)
	•	fetch("/api/auth/login", ...)
* */

require("dotenv").config();
import express = require('express');
import type { Request, Response } from "express";
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import authRouter from './routes/auth';
import cors = require("cors");

const app = express();
const BACKEND_PORT = process.env.PORT;
const FRONTEND_PORT = process.env.FRONTEND_PORT;

if (!BACKEND_PORT || !FRONTEND_PORT) {
  throw new Error("Required server environment variables are missing.");
}

const FRONTEND_ORIGIN = `http://localhost:${FRONTEND_PORT}`;

console.log("🔥 Starting Garbo backend from app.ts");

// ========================================

// MIDDLEWARE

// ========================================
app.set('trust proxy', 1);

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for form POSTs
app.use(cors({ origin: FRONTEND_ORIGIN,  credentials: true }));

// Enforce HTTPS in production
app.use((req: Request, res: Response, next) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.header('x-forwarded-proto');
    if (proto && proto !== "https") {
      return res.status(403).send('HTTPS required.');
    }
  }
  next();
});

// ========================================

// ROUTES

// ========================================
app.use('/api/auth', authRouter);


// ========================================

// START SERVER

// ========================================
app.listen(Number(BACKEND_PORT), () => console.log(`Garbo server is running and operational`));
// export default app;
