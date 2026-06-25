require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'admin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      category_id INT REFERENCES categories(id),
      image_url VARCHAR(500),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
      total NUMERIC(10,2) NOT NULL,
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id),
      quantity INT NOT NULL,
      price NUMERIC(10,2) NOT NULL
    );
  `);

  // Добавляем поле username если не существует
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
  `);

  // Создаём admin если не существует
  const adminUsername = process.env.ADMIN_USERNAME || 'ivan';
  const adminEmail = process.env.ADMIN_EMAIL || 'ivan@admin.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'kosonogov';

  const existing = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [adminUsername, adminEmail]);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await db.query(
      'INSERT INTO users (email, password_hash, name, username, role) VALUES ($1, $2, $3, $4, $5)',
      [adminEmail, hash, 'Ivan', adminUsername, 'admin']
    );
    console.log(`Admin created: ${adminUsername}`);
  } else {
    // Обновляем пароль и роль если пользователь уже есть
    const hash = await bcrypt.hash(adminPassword, 12);
    await db.query(
      'UPDATE users SET password_hash = $1, role = $2, username = $3 WHERE email = $4 OR username = $3',
      [hash, 'admin', adminUsername, adminEmail]
    );
    console.log(`Admin updated: ${adminUsername}`);
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
