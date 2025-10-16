import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env';
import { apiRouter } from './routes';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use('/api', apiRouter);

async function start() {
  try {
    await mongoose.connect(env.mongoUrl);
    console.log('MongoDB connected:', env.mongoUrl);

    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();