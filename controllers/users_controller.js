var express = require('express');
var router = express.Router();
var passport = require('passport');
var sendgrid = require('../config/sendgrid');
import emailConfirm from '../helpers/emails/confirm';
import emailReset from '../helpers/emails/reset';
import User from '../models/user';
import Auth from '../models/auth';

router.route('/users').get((req, res) => {
  res.status(200).json({ a: "user route" });
});

router.route('/users/new').post((req, res) => {
  User.register(
    new User({ username: req.body.username, email: req.body.email }),
    req.body.password,
    (err, user, token) => {
      if (err) {
        res.status(422).json(err);
      } else {
        var authUrl = 'https://www.chessx.io/verify?authToken=' + token;
        sendgrid.API(emailConfirm(user.email, authUrl), function (err, json) {
          if (err) {
            Auth.remove({ user: user._id }, function () {
              User.findByIdAndRemove(user._id, function () {
                res.status(422).json(err);
              });
            });
          } else res.status(200).json('Email confirmation sent!');
        });
      }
    }
  );
});

router.route('/verify_email').post(function (req, res) {
  User.verifyEmail(req.body.authToken, function (err, user) {
    if (err) res.status(422).json(err);
    else res.status(200).json('Email verified!');
  });
});

router.route('/send_reset_email').post(function (req, res) {
  if (!req.body.email) return res.status(401).json('Email required');
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(422).json(err);
    if (!user) return res.status(404).json('Email not found');

    user.setAuthToken(function (err, user, token) {
      var authUrl = 'https://www.chessx.io/reset?authToken=' + token;
      sendgrid.API(emailReset(user.email, authUrl), function (err, json) {
        if (err) return res.status(422).json(err);
        res.status(200).json('Password reset email sent!');
      });
    });
  });
});

router.route('/verify_reset').post(function (req, res) {
  User.verifyReset(req.body, function (err, user) {
    if (err) return res.status(422).json(err);
    if (!user) return res.status(401).json('Invalid password reset');
    res.status(200).json('Password reset!');
  });
});

module.exports = router;
