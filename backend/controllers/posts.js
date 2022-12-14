const Post = require("../models/post");


exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...createdPost,
        id: createdPost._id,
      },
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "Post creation failed"
    })
  })
}

exports.getPosts = (req, res, next) => {
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
    res.status(500).json({
      message: "Fetching posts failed!"
    })
  });
}

exports.getPost =  (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "post not found" });
    }
  }).catch((err) => {
    res.status(500).json({
      message: "Fetching post failed!"
    })
  });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const { id, title, content } = req.body;
  const post = new Post({ _id: id, title, content, imagePath, creator: req.userData.userId });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((result) => {
    if (result.matchedCount > 0) {
      res.status(200).json({ message: "Update successfull" });
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  })
  .catch(err => {
    res.status(500).json({
      message: "Updating post failed!"
    })
  })
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Post Deleted" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    }).catch((err) => {
      res.status(500).json({
        message: "Deleting post failed!"
      })
    });
}