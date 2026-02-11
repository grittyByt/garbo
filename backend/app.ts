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

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
console.log("🔥 Starting Garbo backend from app.ts");

app.set('trust proxy', 1);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for form POSTs

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



app.use('/api/auth', authRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// export default app;
