import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'easy-budget-buddy-super-secret-key-123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amansinghrathore221551_db_user:jVt0FLagIO5QYBgp@cluster0.0l5tf29.mongodb.net/expensehub?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    // Added options for robustness in serverless
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB ERROR:', error.message);
    throw error;
  }
};

// --- Models ---
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  full_name: { type: String },
  is_verified: { type: Number, default: 0 },
  verification_token: { type: String },
  has_completed_onboarding: { type: Number, default: 0 }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  title: { type: String },
  amount: { type: Number },
  type: { type: String },
  category: { type: String },
  date: { type: String },
  note: { type: String },
  created_at: { type: Date, default: Date.now }
});
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

const categoryBudgetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  category: { type: String, required: true },
  limit_amount: { type: Number, required: true }
});
categoryBudgetSchema.index({ user_id: 1, category: 1 }, { unique: true });
const CategoryBudget = mongoose.models.CategoryBudget || mongoose.model('CategoryBudget', categoryBudgetSchema);

const userSettingsSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  monthly_budget: { type: Number },
  currency: { type: String }
});
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

// Middleware: DB Connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database Connection Error', details: err.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: isConnected ? 'connected' : 'disconnected' });
});

// Middleware: Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ---

app.post('/api/auth/signup', async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Account already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await User.create({
      id: userId,
      email,
      password_hash: passwordHash,
      full_name: name,
      is_verified: 0,
      verification_token: otp,
      has_completed_onboarding: 0
    });

    await UserSettings.create({
      user_id: userId,
      monthly_budget: 2000,
      currency: 'INR'
    });
    
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'ExpenseHub <onboarding@resend.dev>',
          to: email,
          subject: `OTP: ${otp}`,
          html: `<b>Your code: ${otp}</b>`
        });
      }
    } catch (e) {
      console.error('Email Fail:', e.message);
    }
    
    res.status(201).json({ message: 'Success', otp });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/verify', async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email, verification_token: otp, is_verified: 0 },
      { $set: { is_verified: 1, verification_token: null } },
      { new: true }
    );
    if (!user) return res.status(400).json({ error: 'Invalid code' });
    res.json({ message: 'Verified' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) return res.status(401).json({ error: 'Unverified' });
    
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      access_token: token,
      user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding }
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.sub });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// --- RESOURCES ---

app.get('/api/settings', authenticateToken, async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne({ user_id: req.user.sub });
    const budgets = await CategoryBudget.find({ user_id: req.user.sub });
    res.json({ settings, category_budgets: budgets });
  } catch (err) {
    next(err);
  }
});

app.post('/api/settings/onboarding', authenticateToken, async (req, res, next) => {
  const { monthly_budget, currency } = req.body;
  try {
    await UserSettings.findOneAndUpdate({ user_id: req.user.sub }, { $set: { monthly_budget, currency } }, { upsert: true });
    await User.findOneAndUpdate({ id: req.user.sub }, { $set: { has_completed_onboarding: 1 } });
    res.json({ message: 'Done' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const txs = await Transaction.find({ user_id: req.user.sub }).sort({ date: -1 });
    res.json({ data: txs });
  } catch (err) {
    next(err);
  }
});

app.post('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const tx = await Transaction.create({ ...req.body, id: crypto.randomUUID(), user_id: req.user.sub });
    res.json({ data: [tx] });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res, next) => {
  try {
    await Transaction.findOneAndDelete({ id: req.params.id, user_id: req.user.sub });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  res.status(500).json({ error: 'Server Error', message: err.message });
});

export default app;
