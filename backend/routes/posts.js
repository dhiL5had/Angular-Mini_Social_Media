const express = require("express");
const router = express.Router();

const multer = require("multer");
const Post = require("../models/post");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let err = new Error("Invalid mime type");
    if (isValid) err = null;
    cb(null, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "_" + Date.now() + "." + ext);
  },
});

router.post("", multer({ storage }).single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imagePath: url + "/images/" + req.file.filename,
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: "Post created successfully",
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath,
      },
    });
  });
});

router.get("", (req, res, next) => {
  const { pagesize, page } = req.query;
  const postQuery = Post.find();
  let fetchedPosts;
  if( pagesize && page) {
    postQuery.skip(pagesize * (page - 1)).limit(pagesize);
  }
  postQuery.then((documents) => {
    fetchedPosts = documents;
   return Post.count();
  }).then(postcount => {
    res.status(200).json({
      message: "posts fetched successfully",
      posts: fetchedPosts,
      postcount,
    });
  })
  .catch((err) => {
    console.log("failed", err);
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "post not foudn" });
    }
  });
});

router.patch("/:id",multer({ storage: storage }).single("image"),(req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const { id, title, content } = req.body;
    const post = new Post({ _id: id, title, content, imagePath });
    Post.updateOne({ _id: req.params.id }, post).then((result) => {
      res.status(200).json({ message: "Update successfull" });
    });
  }
);

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({ message: "Post deleted." });
    })
    .catch((err) => {
      console.log("failed", err);
    });
});

module.exports = router;
