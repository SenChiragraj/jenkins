import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import { authenticateToken } from './middleware/auth.js';
import buildRoutes from './routes/builds.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongoose
//   .connect('mongodb://localhost:27017/jenkins')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/jobs', authenticateToken, jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
