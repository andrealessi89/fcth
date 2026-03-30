import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import partnersRoutes from './routes/partners.js';
import contentRoutes from './routes/content.js';
import newsletterRoutes from './routes/newsletter.js';
import settingsRoutes from './routes/settings.js';
import uploadsRoutes from './routes/uploads.js';
import rankingsRoutes from './routes/rankings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/rankings', rankingsRoutes);

// Serve admin panel (built)
const adminDist = path.join(__dirname, 'admin', 'dist');
app.use('/admin', express.static(adminDist));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'));
});

// Serve frontend (built)
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));

// Serve static files from frontend/public for assets like banner.jpg, logos, etc.
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// SPA fallback - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Start
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`\n=== FCTH Server running on http://localhost:${PORT} ===`);
    console.log(`  API:      http://localhost:${PORT}/api`);
    console.log(`  Admin:    http://localhost:${PORT}/admin`);
    console.log(`  Frontend: http://localhost:${PORT}\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
