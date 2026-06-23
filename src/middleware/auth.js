const jwt = require('jsonwebtoken');

function attachUser(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.clearCookie('token');
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/auth/login');
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('pages/403', { user: req.user });
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole };
