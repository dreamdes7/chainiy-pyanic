require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const catalogRoutes = require('./routes/catalog');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { attachUser } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use('/', catalogRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => res.status(404).render('pages/404', { user: req.user }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on 127.0.0.1:${PORT}`);
});
