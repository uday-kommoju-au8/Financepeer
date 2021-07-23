const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const { request } = require("express");
const Post = mongoose.model("Post");

// Show all posts created by all users, sorted by newest first
router.get("/allpost", requireLogin, (request, response) => {
  Post.find()
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
    .sort("-createdAt")
    .then((posts) => {
      response.json({ posts });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Show only your followed users' posts
router.get("/followedposts", requireLogin, (request, response) => {
  // if postedBy is in your following 
  Post.find({postedBy: {
    $in: request.user.following
  }})
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
    .then((posts) => {
      response.json({ posts });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Show all posts created by user
router.get("/mypost", requireLogin, (request, response) => {
  Post.find({ postedBy: request.user._id })
    .populate("postedBy", "_id name pic")
    .then((mypost) => {
      response.json({ mypost });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Create post
router.post("/createpost", requireLogin, (request, response) => {
  const { body, image } = request.body;
  if (!body || !image) {
    return response.status(422).json({
      error: "Please add all the required fields!",
    });
  }
  // Do not include password in response
  request.user.password = undefined;
  const post = new Post({
    body,
    image,
    postedBy: request.user,
  });
  post
    .save()
    .then((result) => {
      response.json({ post: result });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.put("/like", requireLogin, (request, response) => {
  Post.findByIdAndUpdate(request.body.postId, {
    $push:{likes:request.user._id}
  }, {
    new: true
  })
  .populate("comments.postedBy", "_id name")
  .exec((error, result) => {
    if (error) {
      return response.status(422).json({error:error})
    } else {
      response.json(result)
    }
  })
})

router.put("/unlike", requireLogin, (request, response) => {
  Post.findByIdAndUpdate(request.body.postId, {
    $pull:{likes:request.user._id}
  }, {
    new: true
  })
  .populate("comments.postedBy", "_id name")
  .exec((error, result) => {
    if (error) {
      return response.status(422).json({error:error})
    } else {
      response.json(result)
    }
  })
})

router.put("/comment", requireLogin, (request, response) => {
  const comment = {
    text: request.body.text,
    postedBy: request.user._id
  }
  Post.findByIdAndUpdate(request.body.postId, {
    $push:{comments: comment}
  }, {
    new: true
  })
  .populate("comments.postedBy", "_id name")
  .populate("postedBy", "_id name")
  .exec((error, result) => {
    if (error) {
      return response.status(422).json({error:error})
    } else {
      response.json(result)
    }
  })
})

router.delete("/deletepost/:postId", requireLogin, (request, response) => {
  Post.findOne({ _id: request.params.postId })
    .populate("postedBy", "_id")
    .exec((error, post) => {
      if (error || !post) {
        return response.status(422).json({ error: error });
      }
      if (post.postedBy._id.toString() === request.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            response.json(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
});


module.exports = router;
