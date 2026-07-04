import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import { seedDatabase } from './config/dbSeed.js';
import { requestLogger } from './middleware/loggerMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/appError.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import circulationRoutes from './routes/circulationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Rate limiting in-memory map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 150;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  const limit = rateLimitMap.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  limit.count += 1;
  if (limit.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      status: 'fail',
      message: 'Too many requests from this IP, please try again in 15 minutes.'
    });
  }
  next();
}

// Lightweight CSRF prevention
function csrfProtection(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes(req.headers.host)) {
      return res.status(403).json({
        status: 'fail',
        message: 'CSRF security violation: request origin does not match trust headers.'
      });
    }
  }
  next();
}

// Basic input sanitization to prevent raw HTML XSS injections
function sanitizeInput(req, res, next) {
  const clean = (val) => {
    if (typeof val === 'string') {
      return val.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .trim();
    }
    if (typeof val === 'object' && val !== null) {
      for (const key in val) {
        val[key] = clean(val[key]);
      }
    }
    return val;
  };
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  next();
}

app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(csrfProtection);
app.use(sanitizeInput);

// Comprehensive Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'campuslibrary-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all route for undefined paths
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find path ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

connectDatabase().then(async () => {
  await seedDatabase();
  app.listen(port, () => {
    console.log(`CampusLibrary API listening on port ${port}`);
  });
});
