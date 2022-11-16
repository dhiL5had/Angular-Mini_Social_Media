const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const Post = require("./models/post");

mongoose
  .connect("mongodb://localhost:27017/node-angular")
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log("Connection failed");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.post("/api/posts", (req, res, next) => {
  const { title, content } = req.body;
  const post = new Post({ title, content });
  post.save().then(createdPost => {
    res.status(201).json({ 
      message: "Post created successfully", 
      postId: createdPost._id 
    });
  })
});

app.get("/api/posts", (req, res, next) => {
  Post.find().then(documents => {
    console.log(documents);
    res.status(200).json({
      message: "posts fetched successfully",
      posts: documents,
    });
  }).catch(err => {
    console.log("failed", err);
  })
});

app.delete("/api/posts/:id", (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id})
  .then(result => {
    console.log(result);
    res.status(200).json({message: "Post deleted."})
  })
  .catch(err => {
    console.log("failed",err);
  })
})

module.exports = app;
