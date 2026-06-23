const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// Корзина хранится в cookie как JSON {productId: quantity}
function getCart(req) {
  try { return JSON.parse(req.cookies.cart || '{}'); } catch { return {}; }
}

router.get('/', async (req, res) => {
  const cart = getCart(req);
  const ids = Object.keys(cart).map(Number).filter(Boolean);
  let items = [];
  if (ids.length) {
    const { rows } = await db.query('SELECT * FROM products WHERE id = ANY($1)', [ids]);
    items = rows.map(p => ({ ...p, quantity: cart[p.id] }));
  }
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.render('pages/cart', { user: req.user, items, total });
});

router.post('/add', (req, res) => {
  const cart = getCart(req);
  const id = String(req.body.product_id);
  cart[id] = (cart[id] || 0) + 1;
  res.cookie('cart', JSON.stringify(cart), { maxAge: 7 * 24 * 3600 * 1000 });
  res.redirect('back');
});

router.post('/remove', (req, res) => {
  const cart = getCart(req);
  delete cart[String(req.body.product_id)];
  res.cookie('cart', JSON.stringify(cart), { maxAge: 7 * 24 * 3600 * 1000 });
  res.redirect('/cart');
});

router.post('/checkout', requireAuth, async (req, res) => {
  const cart = getCart(req);
  const ids = Object.keys(cart).map(Number).filter(Boolean);
  if (!ids.length) return res.redirect('/cart');

  const { rows: products } = await db.query('SELECT * FROM products WHERE id = ANY($1)', [ids]);
  const total = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);

  const { rows: [order] } = await db.query(
    'INSERT INTO orders (user_id, total, address) VALUES ($1, $2, $3) RETURNING id',
    [req.user.id, total, req.body.address]
  );
  for (const p of products) {
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
      [order.id, p.id, cart[p.id], p.price]
    );
  }

  res.clearCookie('cart');
  res.redirect('/orders');
});

module.exports = router;
