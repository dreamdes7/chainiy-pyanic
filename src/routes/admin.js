const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin', 'manager'));

router.get('/', async (req, res) => {
  const [{ rows: [stats] }, { rows: recentOrders }] = await Promise.all([
    db.query('SELECT COUNT(*) FILTER (WHERE status=\'pending\') AS pending, COUNT(*) AS total_orders FROM orders'),
    db.query('SELECT o.*, u.name AS user_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 10'),
  ]);
  res.render('pages/admin/dashboard', { user: req.user, stats, recentOrders });
});

// Товары
router.get('/products', async (req, res) => {
  const { rows: products } = await db.query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.name');
  const { rows: categories } = await db.query('SELECT * FROM categories ORDER BY name');
  res.render('pages/admin/products', { user: req.user, products, categories });
});

router.post('/products', async (req, res) => {
  const { name, slug, description, price, stock, category_id, image_url } = req.body;
  await db.query(
    'INSERT INTO products (name, slug, description, price, stock, category_id, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [name, slug, description, price, stock, category_id || null, image_url]
  );
  res.redirect('/admin/products');
});

router.post('/products/:id/delete', requireRole('admin'), async (req, res) => {
  await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.redirect('/admin/products');
});

// Заказы
router.get('/orders', async (req, res) => {
  const { rows: orders } = await db.query(
    'SELECT o.*, u.name AS user_name, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC'
  );
  res.render('pages/admin/orders', { user: req.user, orders });
});

router.post('/orders/:id/status', async (req, res) => {
  await db.query('UPDATE orders SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
  res.redirect('/admin/orders');
});

// Пользователи (только admin)
router.get('/users', requireRole('admin'), async (req, res) => {
  const { rows: users } = await db.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
  res.render('pages/admin/users', { user: req.user, users });
});

router.post('/users/:id/role', requireRole('admin'), async (req, res) => {
  await db.query('UPDATE users SET role = $1 WHERE id = $2', [req.body.role, req.params.id]);
  res.redirect('/admin/users');
});

module.exports = router;
