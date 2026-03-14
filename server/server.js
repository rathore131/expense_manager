const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = 'easy-budget-buddy-super-secret-key-123';

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize Database Schema
db.serialize(() => {
  // Add has_completed_onboarding column if it doesn't exist (Migration)
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Migration error:', err);
      return;
    }
    const hasColumn = columns.some(col => col.name === 'has_completed_onboarding');
    if (!hasColumn) {
      db.run("ALTER TABLE users ADD COLUMN has_completed_onboarding INTEGER DEFAULT 0", (err) => {
        if (!err) console.log('Migration: Added has_completed_onboarding column to users table');
      });
    }
  });

  console.log('Database tables created or already exist.');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    has_completed_onboarding INTEGER DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    amount REAL,
    type TEXT,
    category TEXT,
    date TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS category_budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    category TEXT,
    limit_amount REAL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, category)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    monthly_budget REAL,
    currency TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Configure MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "mlsn.79ce052ecb6281df585f11edb86c748b1df2c31634b0aed75af197b999a14e6d",
});

// Helper functions for DB
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      resolve(this);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

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

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    // Generate a 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    await dbRun(
      'INSERT INTO users (id, email, password_hash, full_name, is_verified, verification_token, has_completed_onboarding) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, passwordHash, name, 0, verificationToken, 0]
    );

    // Initialize default settings (Budget $2000, USD)
    await dbRun(
      'INSERT INTO user_settings (user_id, monthly_budget, currency) VALUES (?, ?, ?)',
      [userId, 2000, 'USD']
    );
    
    // Send VIP OTP via MailerSend
    // Note: If you have a verified domain in MailerSend, you should change "info@domain.com" to your actual verified domain email.
    const sentFrom = new Sender("info@test-68zxl278wqk4j905.mlsender.net", "ExpenseHub");
    const recipients = [new Recipient(email, name)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`Your ExpenseHub Verification Code: ${verificationToken}`)
      .setHtml(`
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
      `)
      .setText(`Hello ${name},\n\nYour 6-digit verification code is: ${verificationToken}\n\nThanks!\nThe ExpenseHub Team`);

    try {
      await mailerSend.email.send(emailParams);
      console.log(`Verification Email Sent to ${email} via MailerSend!`);
      res.status(201).json({ message: 'User created. Please check your email to verify your account.', otp: verificationToken });
    } catch (emailErr) {
      console.error('MailerSend Error (Likely Trial Limit Reached):', emailErr.body?.message || emailErr.message);
      console.log(`[LOCAL DEV] OTP for ${email} is: ${verificationToken}`);
      // Return 201 with OTP embedded so the frontend can show it
      res.status(201).json({ message: 'User created. Email could not be sent (trial limits).', otp: verificationToken });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Verify OTP Route
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const user = await dbGet('SELECT id FROM users WHERE email = ? AND verification_token = ? AND is_verified = 0', [email, otp]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or incorrect verification code. Please try again.' });
    }
    
    await dbRun('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?', [user.id]);
    res.json({ message: 'Email Verified Successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await dbGet('SELECT id, full_name FROM users WHERE email = ?', [email]);
    if (!user) {
      // For security, do not reveal if the email exists or not. Simply return success.
      return res.json({ message: 'If an account exists, a reset code has been sent.' });
    }

    // Generate a 6-digit Reset OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store it in the database (reusing the verification_token column)
    await dbRun('UPDATE users SET verification_token = ? WHERE id = ?', [resetToken, user.id]);

    const sentFrom = new Sender("info@test-68zxl278wqk4j905.mlsender.net", "ExpenseHub Support");
    const recipients = [new Recipient(email, user.full_name)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`ExpenseHub Password Reset Code: ${resetToken}`)
      .setHtml(`
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.full_name},</p>
          <p>We received a request to reset your password. Use the code below to complete the reset process:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; display: inline-block; margin: 20px 0;">
            ${resetToken}
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks!<br>The ExpenseHub Team</p>
        </div>
      `)
      .setText(`Hello ${user.full_name},\n\nYour 6-digit password reset code is: ${resetToken}\n\nThanks!\nThe ExpenseHub Team`);

    try {
      await mailerSend.email.send(emailParams);
      console.log(`Password Reset Email Sent to ${email} via MailerSend!`);
      res.json({ message: 'If an account exists, a reset code has been sent.', dev_otp: null });
    } catch (emailErr) {
      console.error('MailerSend Error (Likely Trial Limit Reached):', emailErr.body?.message || emailErr.message);
      console.log(`[LOCAL DEV] Password Reset OTP for ${email} is: ${resetToken}`);
      // Send OTP back in response for local development since email is capped
      res.json({ message: 'If an account exists, a reset code has been sent (local dev bypass).', dev_otp: resetToken });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const user = await dbGet('SELECT id FROM users WHERE email = ? AND verification_token = ?', [email, otp]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear token
    await dbRun('UPDATE users SET password_hash = ?, verification_token = NULL WHERE id = ?', [passwordHash, user.id]);
    
    res.json({ message: 'Password successfully updated.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (user.is_verified === 0) {
      return res.status(401).json({ error: 'Email not confirmed' });
    }
    
    // Issue JWT
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      user_metadata: { full_name: user.full_name }
    };
    const access_token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    
    // Format response similarly to Supabase for easy frontend integration
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
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Current User Info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, full_name, has_completed_onboarding FROM users WHERE id = ?', [req.user.sub]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, has_completed_onboarding: user.has_completed_onboarding, user_metadata: { full_name: user.full_name } } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- RESOURCE ROUTES (Protected) ---

// Get User Settings & Category Budgets
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM user_settings WHERE user_id = ?', [req.user.sub]);
    const budgets = await dbAll('SELECT category, limit_amount as "limit" FROM category_budgets WHERE user_id = ?', [req.user.sub]);
    
    res.json({ settings, category_budgets: budgets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  const { monthly_budget, currency } = req.body;
  try {
    if (monthly_budget !== undefined && currency !== undefined) {
      await dbRun('UPDATE user_settings SET monthly_budget = ?, currency = ? WHERE user_id = ?', [monthly_budget, currency, req.user.sub]);
    } else if (monthly_budget !== undefined) {
      await dbRun('UPDATE user_settings SET monthly_budget = ? WHERE user_id = ?', [monthly_budget, req.user.sub]);
    } else if (currency !== undefined) {
      await dbRun('UPDATE user_settings SET currency = ? WHERE user_id = ?', [currency, req.user.sub]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New Onboarding Settings Route
app.post('/api/settings/onboarding', authenticateToken, async (req, res) => {
  const { monthly_budget, currency } = req.body;
  if (!currency || monthly_budget === undefined) {
    return res.status(400).json({ error: 'Currency and budget are required' });
  }
  try {
    await dbRun('UPDATE user_settings SET monthly_budget = ?, currency = ? WHERE user_id = ?', [monthly_budget, currency, req.user.sub]);
    await dbRun('UPDATE users SET has_completed_onboarding = 1 WHERE id = ?', [req.user.sub]);
    res.json({ message: 'Onboarding completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Budgets Routes
// Upsert Category Budget
app.post('/api/budgets', authenticateToken, async (req, res) => {
  const { category, limit } = req.body;
  try {
    await dbRun(
      'INSERT INTO category_budgets (id, user_id, category, limit_amount) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, category) DO UPDATE SET limit_amount = ?',
      [crypto.randomUUID(), req.user.sub, category, limit, limit]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await dbAll('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC', [req.user.sub]);
    res.json({ data: transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { title, amount, type, category, date, note } = req.body;
  try {
    const txId = crypto.randomUUID();
    await dbRun(
      'INSERT INTO transactions (id, user_id, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [txId, req.user.sub, title, amount, type, category, date, note]
    );
    const newTx = await dbGet('SELECT * FROM transactions WHERE id = ?', [txId]);
    res.status(201).json({ data: [newTx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Transaction
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.sub]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
console.log(`✅ Local API Server running at http://localhost:${PORT}`);
});
