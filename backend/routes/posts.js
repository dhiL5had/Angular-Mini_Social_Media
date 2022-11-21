const express = require("express");
const router = express.Router();

const checkAuth = require('../middleware/auth');
const extractFile = require('../middleware/file');

const { 
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
 } = require('../controllers/posts');


router.post("", checkAuth, extractFile, createPost);

router.get("", getPosts);

router.get("/:id", getPost);

router.patch("/:id", checkAuth, extractFile, updatePost);

router.delete("/:id", checkAuth, deletePost);

module.exports = router;
