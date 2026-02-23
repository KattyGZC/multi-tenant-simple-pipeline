import express from 'express';
import cors from 'cors';
import { organizationsRouter } from './infrastructure/http/routes/organizations';
import { candidatesRouter } from './infrastructure/http/routes/candidates';
import { errorHandler } from './infrastructure/http/middleware/errorHandler';
import { registerSubscribers } from './infrastructure/events/subscribers';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Register event-driven side effects
registerSubscribers();

// Routes
app.use('/organizations', organizationsRouter);
app.use('/candidates', candidatesRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Backend running on http://localhost:${PORT}`);
});
