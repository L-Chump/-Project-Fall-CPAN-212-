// middleware/auth.js
module.exports = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    res.redirect('/login');
  },

  ensureOwner: function(req, res, next) {
    // assumes movie is loaded on req.movie
    if (!req.session.user) return res.redirect('/login');
    const userId = req.session.user._id.toString();
    if (!req.movie) return res.status(404).send('Movie not found');
    if (req.movie.owner && req.movie.owner.toString() === userId) return next();
    return res.status(403).send('Unauthorized - you are not the owner');
  }
};
