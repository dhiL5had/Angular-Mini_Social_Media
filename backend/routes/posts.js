const express = require('express');
const router = express.Router();

const Post = require('../models/post');


router.post("", (req, res, next) => {
  const { title, content } = req.body;
  const post = new Post({ title, content });
  post.save().then(createdPost => {
    res.status(201).json({ 
      message: "Post created successfully", 
      postId: createdPost._id 
    });
  })
});

router.get("", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "posts fetched successfully",
      posts: documents,
    });
  }).catch(err => {
    console.log("failed", err);
  })
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    console.log(post);
    if(post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: "post not foudn"});
    }
  })
})

router.patch("/:id", (req, res, next) => {
  const { id, title, content } = req.body;
  const post = new Post({_id:id, title, content});
  Post.updateOne({_id: req.params.id}, post).then(result => {
    console.log(result);
    res.status(200).json({message: "Update successfull"});
  })
})

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
  .then(result => {
    console.log(result);
    res.status(200).json({message: "Post deleted."})
  })
  .catch(err => {
    console.log("failed",err);
  })
})

module.exports = router;