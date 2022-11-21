const express = require("express");
const router = express.Router();

const argon = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const user = require("../models/user");

router.post("/signup", (req, res, next) => {
  const { email, password } = req.body;
  argon.hash(password).then(hash => {
    const user = new User({
      email: email,
      password: hash
    })
    user.save().then(result => {
      res.status(201).json({
        message: "user created",
      });
    }).catch(err => {
      res.status(500).json({
          message: "Invalid authentication credentials!"
      });
    });
  });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  let fetchedUser;
  User.findOne({ email: email}).then(user => {
    if (!user) {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      })
    }
    fetchedUser = user;
    return argon.verify(user.password, password);
  })
  .then(result => {
    if (!result) {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      })
    }
    const token = jwt.sign(
      { email: fetchedUser.email,userId: fetchedUser._id}, 
      'secret', 
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      expiresIn: 3600,
      userId: fetchedUser._id
    })
  })
  .catch(err => {
    return res.status(401).json({
      message: "Invalid authentication credentials!"
    })
  })
})

module.exports = router;