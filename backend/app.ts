/*
* This will allow the frontend to:
* 	•	fetch("/api/auth/signup", ...)
	•	fetch("/api/auth/login", ...)
* */

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for form POSTs
// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const proto = req.header("x-forwarded-proto");
    if (proto && proto !== "https") {
      return res.status(403).send("HTTPS required.");
    }
  }
  next();
});



app.use('/api/auth', authRouter);

app.listen(5432, () => console.log("Server running on http://localhost:5432"));
export default app;
