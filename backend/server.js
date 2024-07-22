// server.js
import express from 'express'
import dotenv from 'dotenv';
import { connectDb } from './app/database.js';
import { notFound, errorHandler, trimMiddleware } from './middleware/errorMiddleware.js';
import xssClean from './middleware/xssMiddleware.js';
import userRoutes from './modules/master/routes/userRoutes.js';
import authRoutes from './modules/auth/routes/authRoutes.js';

dotenv.config();

connectDb();

const app = express();
const port = process.env.PORT || 8000;

app.use(xssClean);
app.use(trimMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`selamat datang di aplikasi ${process.env.APP_NAME}`);
});

app.use('/api/users', userRoutes);
app.use('/api/login', authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
