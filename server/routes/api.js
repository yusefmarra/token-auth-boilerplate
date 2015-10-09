var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('users');
require('dotenv').load();



router.post('/user/add', function(req, res) {
  if (req.body.email && req.body.password) {
    new User({name:req.body.email, password:req.body.password}).save(function(err, user) {
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
  if (req.body.email && req.body.password) {
    User.findOne({email: req.body.email}, function(err, user) {
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
              res.statusCode = 401;
              res.json({
                message: "Authentication failed. Wrong password.",
                code: 401
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


router.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, process.env.secret, function(err, decoded) {
      if (!err) {
        req.decoded = decoded;
        next();
      } else {
        res.statusCode = 401;
        res.json({
          message: "No token provided",
          code: 401
        });
      }
    });
  } else {
    res.statusCode = 401;
    res.json({
      message: "No token provided.",
      code: 401
    });
  }
});

// *** ALL ROUTES AFTER THIS POINT REQUIRE A TOKEN *** //
// *** ACCESS THE DATA IN THE TOKEN USING 'req.decoded' *** //


module.exports = router;
