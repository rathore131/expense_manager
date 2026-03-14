import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Heartbeat
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is ONLINE (Simplified ESM)' });
});

// Minimal Signup for Testing
app.post('/api/auth/signup', (req, res) => {
  console.log('Signup hit:', req.body);
  res.status(201).json({ 
    message: 'Connectivity Test Success', 
    received: req.body,
    otp: '123456' 
  });
});

export default app;
