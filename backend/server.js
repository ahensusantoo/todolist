// server.js
import express from 'express'
import dotenv from 'dotenv';
import { connectDb } from './app/database.js';
import { notFound, errorHandler, trimMiddleware } from './middleware/errorMiddleware.js';
import xssClean from './middleware/xssMiddleware.js';

//helper
import { responseCode } from './helper/applicationHelper.js';

// router
import v1Routes from './modules/v1/routes_modules.js';
import v2Routes from './modules/v2/routes_modules.js';

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

// Middleware untuk menangani versi API
const routes = {
  v1: v1Routes,
  v2: v2Routes,
};
app.use('/api/:version', (req, res, next) => {
  const version = req.params.version;
  if (routes[version]) {
    routes[version](req, res, next);
  } else {
    throw responseCode('404', `version api not found`)
  }
});


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
