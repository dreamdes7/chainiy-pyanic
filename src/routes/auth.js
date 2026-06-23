const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.get('/login', (req, res) => res.render('pages/login', { user: req.user, error: null }));
router.get('/register', (req, res) => res.render('pages/register', { user: req.user, error: null }));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.render('pages/login', { user: null, error: 'Неверный email или пароль' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 3600 * 1000 });
  res.redirect('/');
});

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.render('pages/register', { user: null, error: 'Email уже занят' });
  }
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await db.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
    [email, hash, name]
  );
  const user = rows[0];
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 3600 * 1000 });
  res.redirect('/');
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
