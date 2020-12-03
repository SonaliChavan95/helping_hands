const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const static = express.static(__dirname + '/public');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const configRoutes = require('./routes');
const { handlebarsInstance } = require('./helpers/handlebar');

require('dotenv').config({ path: 'variables.env' });
app.use('/public', static);
app.use(express.static('public/images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser('secret'));

app.use(
  session({
    name: 'HelpingHands',
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());

app.use(function (req, res, next) {
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

// Logging Middleware
app.use(async (req, res, next) => {
  let authType = req.session.user ? 'Authenticated' : 'Non-Authenticated';
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${authType} User)`
  );
  next();
});

app.use('/donations/:id/edit', (req, res, next) => {
  if (req.body.method == 'patch') {
    req.method = 'PATCH';
  }
  next();
});

app.use('/donations/:id/approve', (req, res, next) => {
  req.method = 'PATCH';
  next();
});

app.use('/donations/:id/reject', (req, res, next) => {
  req.method = 'PATCH';
  next();
});

app.use('/donations/:id/delete', (req, res, next) => {
  req.method = 'DELETE';
  next();
});

app.engine('handlebars', handlebarsInstance.engine);

app.set('view engine', 'handlebars');

configRoutes(app);

// done! we export it so we can start the site in start.js
module.exports = app;
