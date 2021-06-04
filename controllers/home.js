const User = require('../models/User');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res, next) => {
  if (req.user && req.user.id) {
    User.findById(req.user.id, (err, user) => {
      if (err) {
        return next(err);
      }
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      res.render('home', {
        title: 'Home',
        clock: now.toLocaleTimeString(),
        day: now.toLocaleDateString('id-ID', options),
        user
      });
    });
  } else {
    res.render('home', {
      title: 'Home'
    });
  }
};
