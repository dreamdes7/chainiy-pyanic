const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { rows: featured } = await db.query(
    'SELECT * FROM products WHERE stock > 0 ORDER BY created_at DESC LIMIT 6'
  );
  res.render('pages/home', { user: req.user, featured });
});

router.get('/catalog', async (req, res) => {
  const { category, search } = req.query;
  let q = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.stock > 0';
  const params = [];
  if (category) { params.push(category); q += ` AND c.slug = $${params.length}`; }
  if (search) { params.push(`%${search}%`); q += ` AND p.name ILIKE $${params.length}`; }
  q += ' ORDER BY p.name';
  const { rows: products } = await db.query(q, params);
  const { rows: categories } = await db.query('SELECT * FROM categories ORDER BY name');
  res.render('pages/catalog', { user: req.user, products, categories, query: req.query });
});

router.get('/product/:slug', async (req, res) => {
  const { rows } = await db.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1',
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).render('pages/404', { user: req.user });
  res.render('pages/product', { user: req.user, product: rows[0] });
});

module.exports = router;
