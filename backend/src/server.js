import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/routes.js';
import requestRoutes from './requests/routes.js';
import userRoutes from './users/routes.js';

dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, service: 'approval-api' }));
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/users', userRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
