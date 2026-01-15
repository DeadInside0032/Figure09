const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function hashPasswords() {
  const users = await pool.query('SELECT id, password FROM users');
  for (const user of users.rows) {
    if (user.password.startsWith('$2b$')) continue; // Már hash-elt
    const hash = await bcrypt.hash(user.password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, user.id]);
    console.log(`Felhasználó ${user.id} jelszava titkosítva`);
  }
  await pool.end();
  console.log('Kész!');
}

hashPasswords();
