const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Neon Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost/messenger_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('Unexpected error on idle client', err));

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token hiányzik' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Érvénytelen token' });
    req.user = user;
    next();
  });
}

// Initialize Database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initializeDatabase();

// AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Minden mező kitöltése szükséges' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'Regisztráció sikeres',
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ message: 'A felhasználónév vagy email már létezik' });
    } else {
      res.status(500).json({ message: 'Szerverhiba a regisztráció során' });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Felhasználónév és jelszó szükséges' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      message: 'Bejelentkezés sikeres',
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Szerverhiba a bejelentkezés során' });
  }
});

// USERS ROUTES

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Hiba a felhasználók lekérdezésénél' });
  }
});

// Get single user
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Hiba a felhasználó lekérdezésénél' });
  }
});

// Delete user (admin/owner only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    // Delete user and related messages
    await pool.query('DELETE FROM messages WHERE sender_id = $1 OR recipient_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Felhasználó sikeresen törölve' });
  } catch (err) {
    res.status(500).json({ message: 'Hiba a felhasználó törlésénél' });
  }
});

// MESSAGES ROUTES

// Get all messages for current user
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        m.id, 
        m.sender_id, 
        m.recipient_id, 
        m.content, 
        m.is_read,
        m.created_at,
        u1.username as sender_username,
        u2.username as recipient_username
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.recipient_id = u2.id
      WHERE m.sender_id = $1 OR m.recipient_id = $1
      ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Hiba az üzenetek lekérdezésénél' });
  }
});

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { recipient_id, content } = req.body;

  if (!recipient_id || !content) {
    return res.status(400).json({ message: 'Címzett és üzenet tartalom szükséges' });
  }

  try {
    // Check if recipient exists
    const recipientResult = await pool.query('SELECT id FROM users WHERE id = $1', [recipient_id]);
    if (recipientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Címzett nem található' });
    }

    const result = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, recipient_id, content]
    );

    res.status(201).json({
      message: 'Üzenet sikeresen elküldve',
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Hiba az üzenet küldésénél' });
  }
});

// Get messages between two users
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        m.id, 
        m.sender_id, 
        m.recipient_id, 
        m.content, 
        m.is_read,
        m.created_at,
        u1.username as sender_username,
        u2.username as recipient_username
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.recipient_id = u2.id
      WHERE (m.sender_id = $1 AND m.recipient_id = $2) 
        OR (m.sender_id = $2 AND m.recipient_id = $1)
      ORDER BY m.created_at ASC`,
      [req.user.id, userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Hiba az üzenetek lekérdezésénél' });
  }
});

// STATS ROUTES

// Get dashboard stats
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const messagesResult = await pool.query('SELECT COUNT(*) as count FROM messages');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const unreadResult = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      totalMessages: parseInt(messagesResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      unreadMessages: parseInt(unreadResult.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Hiba a statisztikák lekérdezésénél' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ismeretlen szerverhiba' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express szerver fut a http://localhost:${PORT} porton`);
  console.log('Press CTRL+C a leállításhoz');
});
