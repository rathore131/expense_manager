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
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// --- Mongoose Models ---
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

// Global Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware: Verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    await User.create({
      id: userId,
      email,
      password_hash: passwordHash,
      full_name: name,
      is_verified: 0,
      verification_token: verificationToken,
      has_completed_onboarding: 0
    });

    await UserSettings.create({
      user_id: userId,
      monthly_budget: 2000,
      currency: 'USD'
    });
    
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'ExpenseHub <onboarding@resend.dev>',
          to: email,
          subject: `Your ExpenseHub Verification Code: ${verificationToken}`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h2>Verify Your Account</h2>
              <p>Hello ${name},</p>
              <p>Please use the following 6-digit code to complete your registration:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; display: inline-block; margin: 20px 0;">
                ${verificationToken}
              </div>
              <p>This code is unique to your account and should not be shared.</p>
              <p>Thanks!<br>The ExpenseHub Team</p>
            </div>
          `
        });
      }
      res.status(201).json({ message: 'User created. Please check your email.', otp: verificationToken });
    } catch (emailErr) {
      res.status(201).json({ message: 'User created (email error).', otp: verificationToken });
    }
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/verify', async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const user = await User.findOne({ email, verification_token: otp, is_verified: 0 });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or incorrect verification code.' });
    }
    
    user.is_verified = 1;
    user.verification_token = null;
    await user.save();
    
    res.json({ message: 'Email Verified Successfully!' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/forgot-password', async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset code has been sent.' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_token = resetToken;
    await user.save();

    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'ExpenseHub Support <onboarding@resend.dev>',
          to: email,
          subject: `ExpenseHub Password Reset Code: ${resetToken}`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h2>Reset Your Password</h2>
              <p>Hello ${user.full_name || 'User'},</p>
              <p>We received a request to reset your password. Use the code below to complete the reset process:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; display: inline-block; margin: 20px 0;">
                ${resetToken}
              </div>
              <p>If you did not request this, please ignore this email.</p>
              <p>Thanks!<br>The ExpenseHub Team</p>
            </div>
          `
        });
      }
      res.json({ message: 'If an account exists, a reset code has been sent.', dev_otp: resetToken });
    } catch (emailErr) {
      res.json({ message: 'If an account exists, a reset code has been sent (local bypass).', dev_otp: resetToken });
    }
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/reset-password', async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const user = await User.findOne({ email, verification_token: otp });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password_hash = passwordHash;
    user.verification_token = null;
    await user.save();
    
    res.json({ message: 'Password successfully updated.' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (user.is_verified === 0) {
      return res.status(401).json({ error: 'Email not confirmed' });
    }
    
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      user_metadata: { full_name: user.full_name }
    };
    const access_token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      access_token,
      user: {
        id: user.id,
        email: user.email,
        has_completed_onboarding: user.has_completed_onboarding,
        user_metadata: { full_name: user.full_name }
      }
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.sub });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding, user_metadata: { full_name: user.full_name } } });
  } catch (err) {
    next(err);
  }
});

app.get('/api/settings', authenticateToken, async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne({ user_id: req.user.sub });
    const budgets = await CategoryBudget.find({ user_id: req.user.sub });
    res.json({ 
      settings: settings || {}, 
      category_budgets: budgets.map(b => ({ category: b.category, limit: b.limit_amount })) 
    });
  } catch (err) {
    next(err);
  }
});

app.put('/api/settings', authenticateToken, async (req, res, next) => {
  const { monthly_budget, currency } = req.body;
  try {
    const update = {};
    if (monthly_budget !== undefined) update.monthly_budget = monthly_budget;
    if (currency !== undefined) update.currency = currency;
    await UserSettings.findOneAndUpdate({ user_id: req.user.sub }, { $set: update }, { new: true, upsert: true });
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/settings/onboarding', authenticateToken, async (req, res, next) => {
  const { monthly_budget, currency } = req.body;
  if (!currency || monthly_budget === undefined) return res.status(400).json({ error: 'Currency and budget are required' });
  try {
    await UserSettings.findOneAndUpdate({ user_id: req.user.sub }, { $set: { monthly_budget, currency } }, { new: true, upsert: true });
    await User.findOneAndUpdate({ id: req.user.sub }, { $set: { has_completed_onboarding: 1 } });
    res.json({ message: 'Onboarding completed successfully' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/budgets', authenticateToken, async (req, res, next) => {
  const { category, limit } = req.body;
  try {
    await CategoryBudget.findOneAndUpdate({ user_id: req.user.sub, category }, { $set: { limit_amount: limit }, $setOnInsert: { id: crypto.randomUUID() } }, { new: true, upsert: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.sub }).sort({ date: -1, created_at: -1 });
    res.json({ data: transactions.map(tx => ({ id: tx.id, user_id: tx.user_id, title: tx.title, amount: tx.amount, type: tx.type, category: tx.category, date: tx.date, note: tx.note, created_at: tx.created_at })) });
  } catch (err) {
    next(err);
  }
});

app.post('/api/transactions', authenticateToken, async (req, res, next) => {
  const { title, amount, type, category, date, note } = req.body;
  try {
    const newTx = await Transaction.create({ id: crypto.randomUUID(), user_id: req.user.sub, title, amount, type, category, date, note });
    res.status(201).json({ data: [{ id: newTx.id, user_id: newTx.user_id, title: newTx.title, amount: newTx.amount, type: newTx.type, category: newTx.category, date: newTx.date, note: newTx.note, created_at: newTx.created_at }] });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Transaction.findOneAndDelete({ id, user_id: req.user.sub });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(err.status || 500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
