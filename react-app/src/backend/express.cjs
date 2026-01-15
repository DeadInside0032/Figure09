// ...existing code...
// Mark message as read (helyes helyen, a route-ok között)

// ════════════════════════════════════════
// MESSAGES ROUTES
// ════════════════════════════════════════

// ... korábbi üzenetkezelő endpointok ...

// PATCH: Mark message as read
app.patch('/api/messages/:id/read', async (req, res) => {
  const messageId = parseInt(req.params.id);
  try {
    const result = await pool.query(
      'UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [messageId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Üzenet nem található' });
    }
    res.json({ message: 'Üzenet olvasottra állítva', data: result.rows[0] });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Hiba az üzenet olvasottra állításakor' });
  }
});
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug: Database URL betöltésének ellenőrzése
console.log('📍 DATABASE_URL loaded:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon szükséglet
});

// ════════════════════════════════════════
// USERS ROUTES
// ════════════════════════════════════════

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Felhasználónév, email és jelszó szükséges' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password, is_admin, created_at FROM users WHERE username = $1 AND email = $2',
      [username, email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Felhasználó nem található vagy adatok nem egyeznek' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Hibás jelszó' });
    }
    res.json({
      message: 'Sikeres bejelentkezés',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin || false,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Hiba a bejelentkezés során' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Felhasználónév, email és jelszó szükséges' });
  }

  try {
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'A felhasználónév vagy email már létezik' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default: is_admin = false)
    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, false, NOW(), NOW()) RETURNING id, username, email, is_admin, created_at',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Sikeres regisztráció',
      user: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Hiba a regisztráció során' });
  }
});

// Get all users
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 Express szerver működik',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, COALESCE(is_admin, false) as is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Hiba a felhasználók lekérésekor', error: err.message });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, COALESCE(is_admin, false) as is_admin, created_at FROM users WHERE id = $1',
      [parseInt(req.params.id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Hiba a felhasználó lekérésekor' });
  }
});

// Create user (new user from UI)
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Felhasználónév, email és jelszó szükséges' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'A felhasználónév vagy email már létezik' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, false, NOW(), NOW()) RETURNING id, username, email, is_admin, created_at',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Felhasználó sikeresen létrehozva',
      user: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Hiba a felhasználó létrehozásakor' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Start transaction for deleting user and associated messages
    const result = await pool.query('BEGIN');

    // Delete messages associated with this user
    await pool.query(
      'DELETE FROM messages WHERE sender_id = $1 OR recipient_id = $1',
      [userId]
    );

    // Delete the user
    const deleteResult = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    await pool.query('COMMIT');

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    res.json({ message: 'Felhasználó sikeresen törölve' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Hiba a felhasználó törlésekkor' });
  }
});

// ════════════════════════════════════════
// MESSAGES ROUTES
// ════════════════════════════════════════

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
             u1.username as sender_username, u2.username as recipient_username
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.recipient_id = u2.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Hiba az üzenetek lekérésekor' });
  }
});

// Get messages for current user
app.get('/api/messages/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await pool.query(`
      SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
             u1.username as sender_username, u2.username as recipient_username
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.recipient_id = u2.id
      WHERE m.sender_id = $1 OR m.recipient_id = $1
      ORDER BY m.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get user messages error:', err);
    res.status(500).json({ message: 'Hiba az üzenetek lekérésekor' });
  }
});

// Send message
app.post('/api/messages', async (req, res) => {
  const { sender_id, recipient_id, content } = req.body;

  if (!sender_id || !recipient_id || !content) {
    return res.status(400).json({ message: 'Küldő, fogadó és üzenet tartalom szükséges' });
  }

  try {
    await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, content, is_read, created_at, updated_at) VALUES ($1, $2, $3, false, NOW(), NOW())',
      [parseInt(sender_id), parseInt(recipient_id), content]
    );

    const getResult = await pool.query(`
      SELECT m.id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at,
             u1.username as sender_username, u2.username as recipient_username
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.recipient_id = u2.id
      WHERE m.sender_id = $1 AND m.recipient_id = $2
      ORDER BY m.created_at DESC LIMIT 1
    `, [parseInt(sender_id), parseInt(recipient_id)]);

    res.status(201).json({
      message: 'Üzenet sikeresen elküldve',
      data: getResult.rows[0]
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Hiba az üzenet küldésekor' });
  }
});

// ════════════════════════════════════════
// STATS ROUTES
// ════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 Express szerver működik',
    timestamp: new Date().toISOString()
  });
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const messageCount = await pool.query('SELECT COUNT(*) as count FROM messages');

    res.json({
      totalUsers: parseInt(userCount.rows[0].count) || 0,
      totalMessages: parseInt(messageCount.rows[0].count) || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Hiba a statisztikák lekérésekor' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ismeretlen szerverhiba' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🚀 Express szerver fut!');
  console.log(`  📍 http://localhost:${PORT}`);
  console.log('  💾 PostgreSQL Neon adatbázis csatlakozva');
  console.log('═══════════════════════════════════════════════════════════\n');
});

module.exports = app;
