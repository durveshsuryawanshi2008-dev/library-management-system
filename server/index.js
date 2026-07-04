import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import { seedDatabase } from './config/dbSeed.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'campuslibrary-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);

connectDatabase().then(async () => {
  await seedDatabase();
  app.listen(port, () => {
    console.log(`CampusLibrary API listening on port ${port}`);
  });
});
