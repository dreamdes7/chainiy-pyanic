const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows: orders } = await db.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.render('pages/orders', { user: req.user, orders });
});

router.get('/:id', async (req, res) => {
  const { rows: [order] } = await db.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!order) return res.status(404).render('pages/404', { user: req.user });
  const { rows: items } = await db.query(
    'SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1',
    [order.id]
  );
  res.render('pages/order-detail', { user: req.user, order, items });
});

module.exports = router;
