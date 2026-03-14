const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'easy-budget-buddy-super-secret-key-123';
const MONGODB_URI = process.env.MONGODB_URI;

// Initial state
let isConnected = false;

// 1. Simple Heartbeat (No DB/Auth)
app.get('/api/test', (req, res) => {
  res.status(200).send('API is ONLINE');
});

// 2. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: isConnected ? 'connected' : 'disconnected',
    mongo_uri_exists: !!MONGODB_URI,
    resend_key_exists: !!process.env.RESEND_API_KEY
  });
});

// Database Connection
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is missing');

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    isConnected = false;
    console.error('DB ERROR:', error.message);
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

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

// DB Connection Middleware
app.use(async (req, res, next) => {
  // Skip DB for these routes
  if (req.path === '/api/health' || req.path === '/api/test' || req.path === '/api/heartbeat') return next();
  
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database service unavailable', message: err.message });
  }
});

// Middleware: Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.post('/api/auth/signup', async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Fields missing' });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await User.create({ id: userId, email, password_hash: passwordHash, full_name: name, verification_token: otp });
    await UserSettings.create({ user_id: userId, monthly_budget: 2000, currency: 'INR' });
    
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'ExpenseHub <onboarding@resend.dev>',
        to: email,
        subject: `Verification Code: ${otp}`,
        html: `<b>Your OTP is: ${otp}</b>`
      });
    }
    res.status(201).json({ message: 'Success', otp });
  } catch (err) { next(err); }
});

app.post('/api/auth/verify', async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOneAndUpdate({ email, verification_token: otp }, { $set: { is_verified: 1, verification_token: null } });
    if (!user) return res.status(400).json({ error: 'Invalid OTP' });
    res.json({ message: 'Verified' });
  } catch (err) { next(err); }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.is_verified) return res.status(401).json({ error: 'Account not verified' });
    
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ access_token: token, user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding } });
  } catch (err) { next(err); }
});

app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.sub });
    res.json({ user });
  } catch (err) { next(err); }
});

app.get('/api/settings', authenticateToken, async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne({ user_id: req.user.sub });
    const budgets = await CategoryBudget.find({ user_id: req.user.sub });
    res.json({ settings, category_budgets: budgets });
  } catch (err) { next(err); }
});

app.post('/api/settings/onboarding', authenticateToken, async (req, res, next) => {
  const { monthly_budget, currency } = req.body;
  try {
    await UserSettings.findOneAndUpdate({ user_id: req.user.sub }, { $set: { monthly_budget, currency } }, { upsert: true });
    await User.findOneAndUpdate({ id: req.user.sub }, { $set: { has_completed_onboarding: 1 } });
    res.json({ message: 'Onboarding complete' });
  } catch (err) { next(err); }
});

app.get('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const txs = await Transaction.find({ user_id: req.user.sub }).sort({ date: -1 });
    res.json({ data: txs });
  } catch (err) { next(err); }
});

app.post('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const txBody = { ...req.body, id: crypto.randomUUID(), user_id: req.user.sub };
    const tx = await Transaction.create(txBody);
    res.status(201).json({ data: [tx] });
  } catch (err) { next(err); }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res, next) => {
  try {
    await Transaction.findOneAndDelete({ id: req.params.id, user_id: req.user.sub });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Final Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER FATAL ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
