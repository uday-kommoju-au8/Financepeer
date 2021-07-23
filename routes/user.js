const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const { request } = require("express");
const Post = mongoose.model("Post");
const User = mongoose.model("User")

router.get("/user/:id", requireLogin, (request, response) => {
    User.findOne({_id:request.params.id})
    .select("-password")
    .then(user => {
        Post.find({postedBy:request.params.id})
        .populate("postedBy", "_id name")
        .exec((error, posts) => {
            if (error) {
                return response.status(422).json(({error:error}))
            }
            response.json({user, posts})
        })
    }).catch(error => {
        return response.status(404).json({error: "User not found"})
    })
})

router.put("/follow", requireLogin, (request, response) => {
    User.findByIdAndUpdate(request.body.followId, {
        $push:{followers: request.user._id}
    }, {
        new: true
    },  (error, result) => {
        if (error) {
            return response.status(422).json({error: error})
        }
        User.findByIdAndUpdate(request.user._id, {
            $push:{following: request.body.followId}
        }, {
            new: true
        }).select("-password").then(result => {
            response.json(result)
        }).catch(error => {
            return response.status(422).json({error: error})
        })
    })
})

router.put("/unfollow", requireLogin, (request, response) => {
    User.findByIdAndUpdate(request.body.unfollowId, {
        $pull:{followers: request.user._id}
    }, {
        new: true
    },  (error, result) => {
        if (error) {
            return response.status(422).json({error: error})
        }
        User.findByIdAndUpdate(request.user._id, {
            $pull:{following: request.body.unfollowId}
        }, {
            new: true
        }).select("-password").then(result => {
            response.json(result)
        }).catch(error => {
            return response.status(422).json({error: error})
        })
    })
})


router.put("/updatepic", requireLogin, (request, response) => {
    User.findByIdAndUpdate(request.user._id, {$set:{
        pic: request.body.pic
    }}, {
        new: true
    }, (error, result) => {
        if (error) {
            return response.status(422).json({error: "Profile pic could not be updated"})
        }
        response.json(result)
    })
})

router.post("/searchusers", (request, response) => {
    let userPattern = new RegExp("^" + request.body.query)
    User.find({name: {$regex: userPattern, $options: "i"}})
    .select("_id name")
    .then(user => {
        response.json({user})
    }).catch(error => {
        console.log(error)
    })
})

module.exports = router;
