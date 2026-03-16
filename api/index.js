// Vercel Serverless Function — native handler (no Express needed)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';

// --- Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'easy-budget-buddy-super-secret-key-123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amansinghrathore221551_db_user:jVt0FLagIO5QYBgp@cluster0.0l5tf29.mongodb.net/expensehub?retryWrites=true&w=majority&appName=Cluster0';

// --- DB Connection (cached across warm invocations) ---
let cached = global._mongoConn;
if (!cached) cached = global._mongoConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

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
  title: String, amount: Number, type: String,
  category: String, date: String, note: String,
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
  monthly_budget: Number, currency: String
});
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);

// --- Email ---
const resend = new Resend(process.env.RESEND_API_KEY || 're_N6Yooqzp_3NtC87zXjH16LYX1ba6EXNaA');

// --- Auth Helper ---
function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

// --- JSON helpers ---
function json(res, status, data) {
  res.status(status).json(data);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// ============================================
// MAIN HANDLER
// ============================================
export default async function handler(req, res) {
  // CORS
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;

  // --- Health / Test (no DB needed) ---
  if (url === '/api/test' || url === '/api/test/') {
    return json(res, 200, { message: 'API is ONLINE', timestamp: Date.now() });
  }
  if (url === '/api/health' || url === '/api/health/') {
    return json(res, 200, {
      status: 'ok',
      mongo: !!MONGODB_URI,
      resend: !!process.env.RESEND_API_KEY
    });
  }

  // --- Connect to DB for all other routes ---
  try {
    if (!MONGODB_URI) return json(res, 503, { error: 'MONGODB_URI not configured' });
    await connectDB();
  } catch (err) {
    return json(res, 503, { error: 'Database connection failed', message: err.message });
  }

  try {
    // ==================== AUTH ROUTES ====================

    // POST /api/auth/signup
    if (url.startsWith('/api/auth/signup') && method === 'POST') {
      const { name, email, password } = req.body;
      if (!email || !password || !name) return json(res, 400, { error: 'Name, email and password are required' });

      const existing = await User.findOne({ email });
      if (existing) return json(res, 400, { error: 'An account with this email already exists' });

      const hash = await bcrypt.hash(password, 10);
      const userId = randomUUID();
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await User.create({ id: userId, email, password_hash: hash, full_name: name, verification_token: otp });
      await UserSettings.create({ user_id: userId, monthly_budget: 2000, currency: 'INR' });

      // Send verification email
      try {
        await resend.emails.send({
          from: 'ExpenseHub <onboarding@resend.dev>',
          to: email,
          subject: `Your Verification Code: ${otp}`,
          html: `<div style="font-family:sans-serif;text-align:center;padding:20px"><h2>Verify Your Account</h2><p>Hello ${name},</p><p>Your 6-digit code:</p><div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#3b82f6;padding:20px;border:1px solid #e5e7eb;border-radius:8px;display:inline-block;margin:20px 0">${otp}</div></div>`
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
      }

      return json(res, 201, { message: 'Account created. Please check your email for the verification code.' });
    }

    // POST /api/auth/verify
    if (url.startsWith('/api/auth/verify') && method === 'POST') {
      const { email, otp } = req.body;
      if (!email || !otp) return json(res, 400, { error: 'Email and OTP required' });

      const user = await User.findOneAndUpdate(
        { email, verification_token: otp, is_verified: 0 },
        { $set: { is_verified: 1, verification_token: null } },
        { new: true }
      );
      if (!user) return json(res, 400, { error: 'Invalid verification code' });
      return json(res, 200, { message: 'Email verified successfully' });
    }

    // POST /api/auth/forgot-password
    if (url.startsWith('/api/auth/forgot-password') && method === 'POST') {
      const { email } = req.body;
      if (!email) return json(res, 400, { error: 'Email required' });

      const user = await User.findOne({ email });
      if (!user) return json(res, 200, { message: 'If an account exists, a reset code has been sent.' });

      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verification_token = resetOtp;
      await user.save();

      try {
        await resend.emails.send({
          from: 'ExpenseHub <onboarding@resend.dev>',
          to: email,
          subject: `Password Reset Code: ${resetOtp}`,
          html: `<div style="font-family:sans-serif;text-align:center;padding:20px"><h2>Reset Your Password</h2><p>Your code:</p><div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#3b82f6;padding:20px;border:1px solid #e5e7eb;border-radius:8px;display:inline-block;margin:20px 0">${resetOtp}</div></div>`
        });
      } catch (e) { console.error('Email error:', e.message); }

      return json(res, 200, { message: 'If an account exists, a reset code has been sent.' });
    }

    // POST /api/auth/reset-password
    if (url.startsWith('/api/auth/reset-password') && method === 'POST') {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) return json(res, 400, { error: 'All fields required' });

      const user = await User.findOne({ email, verification_token: otp });
      if (!user) return json(res, 400, { error: 'Invalid or expired code' });

      user.password_hash = await bcrypt.hash(newPassword, 10);
      user.verification_token = null;
      await user.save();
      return json(res, 200, { message: 'Password reset successful' });
    }

    // POST /api/auth/login
    if (url.startsWith('/api/auth/login') && method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) return json(res, 400, { error: 'Email and password required' });

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return json(res, 401, { error: 'Invalid email or password' });
      }
      if (!user.is_verified) return json(res, 401, { error: 'Please verify your email first' });

      const token = jwt.sign(
        { sub: user.id, email: user.email, user_metadata: { full_name: user.full_name } },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return json(res, 200, {
        access_token: token,
        user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding, user_metadata: { full_name: user.full_name } }
      });
    }

    // GET /api/auth/me
    if (url.startsWith('/api/auth/me') && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const user = await User.findOne({ id: decoded.sub });
      if (!user) return json(res, 404, { error: 'User not found' });
      return json(res, 200, { user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding, user_metadata: { full_name: user.full_name } } });
    }

    // ==================== SETTINGS ====================

    // GET /api/settings
    if (url.startsWith('/api/settings') && method === 'GET' && !url.includes('onboarding')) {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const settings = await UserSettings.findOne({ user_id: decoded.sub });
      const budgets = await CategoryBudget.find({ user_id: decoded.sub });
      return json(res, 200, { settings: settings || {}, category_budgets: budgets.map(b => ({ category: b.category, limit: b.limit_amount })) });
    }

    // PUT /api/settings
    if (url.startsWith('/api/settings') && method === 'PUT' && !url.includes('onboarding')) {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const { monthly_budget, currency } = req.body;
      const update = {};
      if (monthly_budget !== undefined) update.monthly_budget = monthly_budget;
      if (currency !== undefined) update.currency = currency;
      await UserSettings.findOneAndUpdate({ user_id: decoded.sub }, { $set: update }, { upsert: true });
      return json(res, 200, { success: true });
    }

    // POST /api/settings/onboarding
    if (url.startsWith('/api/settings/onboarding') && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const { monthly_budget, currency } = req.body;
      await UserSettings.findOneAndUpdate({ user_id: decoded.sub }, { $set: { monthly_budget, currency } }, { upsert: true });
      await User.findOneAndUpdate({ id: decoded.sub }, { $set: { has_completed_onboarding: 1 } });
      return json(res, 200, { message: 'Onboarding complete' });
    }

    // ==================== BUDGETS ====================

    // POST /api/budgets
    if (url.startsWith('/api/budgets') && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const { category, limit } = req.body;
      await CategoryBudget.findOneAndUpdate(
        { user_id: decoded.sub, category },
        { $set: { limit_amount: limit }, $setOnInsert: { id: randomUUID() } },
        { upsert: true }
      );
      return json(res, 200, { success: true });
    }

    // ==================== TRANSACTIONS ====================

    // GET /api/transactions
    if (url.startsWith('/api/transactions') && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const txs = await Transaction.find({ user_id: decoded.sub }).sort({ date: -1, created_at: -1 });
      return json(res, 200, { data: txs });
    }

    // POST /api/transactions
    if (url.startsWith('/api/transactions') && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const { title, amount, type, category, date, note } = req.body;
      const tx = await Transaction.create({ id: randomUUID(), user_id: decoded.sub, title, amount, type, category, date, note });
      return json(res, 201, { data: [tx] });
    }

    // DELETE /api/transactions/:id
    if (url.startsWith('/api/transactions/') && method === 'DELETE') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return json(res, 401, { error: 'Unauthorized' });

      const id = url.split('/api/transactions/')[1]?.split('?')[0];
      await Transaction.findOneAndDelete({ id, user_id: decoded.sub });
      return json(res, 200, { success: true });
    }

    // --- Fallback ---
    return json(res, 404, { error: 'Route not found', path: url, method });

  } catch (err) {
    console.error('HANDLER ERROR:', err);
    return json(res, 500, { error: 'Internal server error', message: err.message });
  }
}
