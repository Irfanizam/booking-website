// backend/routes/auth.js
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const router = express.Router();
const db = new Database(path.join(__dirname, '../Merchantdb/merchant.db'));

// Initialize users table if it doesn't exist
const initUsersTable = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        business_name TEXT,
        merchant_id INTEGER,
        role TEXT DEFAULT 'merchant',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Users table initialized');
  } catch (err) {
    console.error('Error initializing users table:', err);
  }
};

initUsersTable();

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, business_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const stmt = db.prepare('INSERT INTO users (email, password, business_name) VALUES (?, ?, ?)');
    const info = stmt.run(email, hashedPassword, business_name || null);

    res.json({
      success: true,
      user: {
        id: info.lastInsertRowid,
        email,
        business_name
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get merchant info if exists
    let merchant = null;
    if (user.merchant_id) {
      merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(user.merchant_id);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        business_name: user.business_name,
        merchant_id: user.merchant_id,
        role: user.role
      },
      merchant
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user (for session management)
router.get('/me', (req, res) => {
  try {
    const userId = req.headers['user-id']; // Simple auth for now
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare('SELECT id, email, business_name, merchant_id, role FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let merchant = null;
    if (user.merchant_id) {
      merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(user.merchant_id);
    }

    res.json({ success: true, user, merchant });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

