




const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, is_admin, created_at, updated_at FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Hiba a felhasználók lekérésekor' });
  }
});

// --- LOGIN ENDPOINT ---
app.post('/api/login', async (req, res) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    return res.status(400).json({ message: 'Felhasználónév vagy email és jelszó szükséges' });
  }
  try {
    // Felhasználó keresése felhasználónév vagy email alapján
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username || '', email || '']
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Hibás felhasználónév/email vagy jelszó' });
    }
    // Jelszó ellenőrzése
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Hibás felhasználónév/email vagy jelszó' });
    }
    // Ne adjuk vissza a jelszót
    const { password: _, ...userData } = user;
    res.json({ user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Hiba a bejelentkezés során' });
  }
});


console.log('📍 DATABASE_URL loaded:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');


app.post('/api/register', async (req, res) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

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

app.delete('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const result = await pool.query('BEGIN');

    await pool.query(
      'DELETE FROM messages WHERE sender_id = $1 OR recipient_id = $1',
      [userId]
    );

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 Express szerver működik',
    timestamp: new Date().toISOString()
  });
});

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ismeretlen szerverhiba' });
});

app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🚀 Express szerver fut!');
  console.log(`  📍 http://localhost:${PORT}`);
  console.log('  💾 PostgreSQL Neon adatbázis csatlakozva');
  console.log('═══════════════════════════════════════════════════════════\n');
});

module.exports = app;
