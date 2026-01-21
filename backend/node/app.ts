import express from 'express';
import authRouter from '../routes/auth';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form POSTs

app.use('/api/auth', authRouter);

app.listen(5432, () => console.log("Server running on http://localhost:5432"));
export default app;
