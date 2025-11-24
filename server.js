// server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function() {
  console.log('Connected to MongoDB');
}).catch(function(err) {
  console.error('MongoDB connection error:', err);
});

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// make currentUser available in templates
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
});

// routes
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/auth');

app.use('/movies', moviesRouter);
app.use('/', authRouter);

// index page
app.get('/', function(req, res) {
  res.render('index', { title: 'Movies App' });
});

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log('Server started on port', PORT);
});
