var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('users');
require('dotenv').load();



router.post('/user/add', function(req, res) {
  if (req.body.name && req.body.password) {
    new User({name:req.body.name, password:req.body.password}).save(function(err, user) {
      if (!err) {
        res.statusCode = 200;
        res.json({
          message: "User successfully created.",
          code: 200,
        });
      } else {
        if (err.code === 11000) {
          res.statusCode = 400;
          res.json({
            message: "That username already exists",
            code: 400
          });
        } else { throw err; }
      }
    });
  } else {
    res.statusCode = 400;
    res.json({
      message: "Must provide all fields",
      code: 400
    });
  }
});

router.post('/user/authenticate', function(req, res) {
  if (req.body.name && req.body.password) {
    User.findOne({name: req.body.name}, function(err, user) {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.json({message: "Authentication Failed. Some kinda error.", code: 400, err: err});
      }
      if (!user) {
        res.statusCode = 404;
        res.json({message: "Authentication Failed. User not found", code:404});
      } else {

        user.comparePassword(req.body.password, function(err, match) {
          if (!err) {
            if (match) {
              var token = jwt.sign(user, process.env.secret, {
                expiresInMinutes: 1440,
              });
              res.statusCode = 200;
              res.json({
                message: "Authentication succeeded.",
                token: token,
                code: 200
              });
            } else {
              res.statusCode = 403;
              res.json({
                message: "Authentication failed. Wrong password.",
                code: 403
              });
            }
          } else { throw err; }
        });
      }
    });
  } else {
    res.statusCode = 400;
    res.json({message: "You must provide all fields", code: 400});
  }
});


module.exports = router;
