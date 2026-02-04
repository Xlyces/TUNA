import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import bookingsRouter from './routes/bookings';
import creditsRouter from './routes/credits';
import verifyRouter from './routes/verify';
import lessonsRouter from './routes/lessons';
import webhooksRouter from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Cloudflare Pages default domain pattern
  /^https:\/\/.*\.pages\.dev$/,
  // Railway default domain pattern
  /^https:\/\/.*\.up\.railway\.app$/,
];

// Allow custom domains from environment variables
if (process.env.ALLOWED_ORIGINS) {
  const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim());
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin) {
      return callback(new Error('Not allowed by CORS - no origin'));
    }

    // Check against allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS - origin: ${origin}`));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Raw body for webhooks (Stripe needs raw body for signature verification)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/webhooks', webhooksRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

