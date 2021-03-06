require('babel-register');

var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var swig  = require('swig');
var app = express();
var config = require('./config/config');
var passport = require('./config/passport');
var session = require('./config/session');
var enforce = require('express-sslify');
var compress = require('compression');

// APP
app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

if (config.env === 'production')
  app.use(enforce.HTTPS({trustProtoHeader: true}));

// API ROUTES
var users = require('./controllers/users_controller');
var sessions = require('./controllers/sessions_controller');

app.use('/api', users);
app.use('/api', sessions);

// NON-API ROUTES
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var ClientRoutes = require('./app/routes');

app.use(function(req, res) {
  Router.match(
    { routes: ClientRoutes.default, location: req.url },
    function(err, redirectLocation, renderProps) {
      if (err) {
        res.status(500).send(err.message);
      } else if (redirectLocation) {
        res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) { // route react components
        var html = ReactDOM.renderToString(React.createElement(Router.RouterContext, renderProps));
        var page = swig.renderFile('views/index.html', { html: html });
        res.status(200).send(page);
      } else {
        res.status(404).send('Page Not Found');
      }
    }
  );
});

// START
var server = app.listen(app.get('port'), function() {
  console.info('express server listening on port ' + app.get('port'));
});

exports.server = server;
exports.app = app;

// SOCKET IO
require('./sockets/connection');
require('./helpers/cleanup');
