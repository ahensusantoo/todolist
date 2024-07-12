// server.js
import express from 'express'
import dotenv from 'dotenv';
import { connectDb } from './app/database.js';  // Perhatikan perubahan di sini
import { notFound, errorHandler, trimMiddleware } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

connectDb();  // Panggil fungsi connectDb untuk menginisialisasi koneksi database

const app = express();
const port = process.env.PORT || 8000;

app.use(trimMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
