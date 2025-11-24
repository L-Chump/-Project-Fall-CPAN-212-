const express = require('express');
const router = express.Router();
const Movie = require('../models/Moive');
const { ensureLoggedIn, ensureOwner } = require('../middleware/auth');

router.get('/', async function(req, res) {
  const movies = await Movie.find().sort({ _id: -1 }).exec();
  res.render('movies', { title: 'All Movies', movies });
});

router.get('/add', ensureLoggedIn, function(req, res) {
  res.render('movie_form', { title: 'Add Movie', movie: {}, errors: null });
});

router.post('/add', ensureLoggedIn, async function(req, res) {
  const body = req.body;

  let genres = body.genres || "";
  if (Array.isArray(genres)) {
    genres = genres.join(", ");
  } else {
    genres = genres.split(",").map(s => s.trim()).join(", ");
  }

  const movie = new Movie({
    name: body.name,
    description: body.description,
    year: body.year ? parseInt(body.year) : undefined,
    genres: genres,
    rating: body.rating ? Number(body.rating) : undefined,
    user: req.session.user._id
  });

  const errors = [];
  if (!movie.name) errors.push("Name is required");
  if (!movie.description) errors.push("Description is required");
  if (!movie.year) errors.push("Year is required");
  if (!movie.genres) errors.push("Genres required");
  if (!movie.rating) errors.push("Rating is required");
  if (movie.rating < 1 || movie.rating > 10) errors.push("Rating must be 1–10");

  if (errors.length) {
    return res.render("movie_form", { title: "Add Movie", movie, errors });
  }

  await movie.save();
  res.redirect('/movies');
});

router.param('id', async function(req, res, next, id) {
  try {
    const movie = await Movie.findById(id).exec();
    if (!movie) return next(new Error("Movie not found"));
    req.movie = movie;
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/:id', function(req, res) {
  res.render('movie_detail', { title: req.movie.name, movie: req.movie });
});

router.get('/:id/edit', ensureLoggedIn, ensureOwner, function(req, res) {
  res.render('movie_edit', { title: 'Edit Movie', movie: req.movie, errors: null });
});

router.post('/:id/edit', ensureLoggedIn, ensureOwner, async function(req, res) {
  const body = req.body;

  let genres = body.genres || "";
  if (Array.isArray(genres)) {
    genres = genres.join(", ");
  } else {
    genres = genres.split(",").map(s => s.trim()).join(", ");
  }

  req.movie.name = body.name;
  req.movie.description = body.description;
  req.movie.year = parseInt(body.year);
  req.movie.genres = genres;
  req.movie.rating = Number(body.rating);

  const errors = [];
  if (!req.movie.name) errors.push("Name is required");
  if (!req.movie.description) errors.push("Description is required");
  if (!req.movie.year) errors.push("Year is required");
  if (!req.movie.genres) errors.push("Genres required");
  if (!req.movie.rating) errors.push("Rating is required");
  if (req.movie.rating < 1 || req.movie.rating > 10) errors.push("Rating must be 1–10");

  if (errors.length) {
    return res.render('movie_edit', { title: 'Edit Movie', movie: req.movie, errors });
  }

  await req.movie.save();
  res.redirect('/movies/' + req.movie._id);
});

router.post('/:id/delete', ensureLoggedIn, ensureOwner, async function(req, res) {
  await req.movie.deleteOne();
  res.redirect('/movies');
});

module.exports = router;
