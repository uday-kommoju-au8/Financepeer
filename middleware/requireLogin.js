const jwt = require("jsonwebtoken");
const { JWT_secret } = require("../config/keys");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (request, response, next) => {
  const { authorization } = request.headers;
 
  if (!authorization) {
    return response.status(401).json({ error: "You must be logged in!" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_secret, (error, payload) => {
    if (error) {
      return response.status(401).json({
        error: "You must be logged in!",
      });
    }
    
    const { _id } = payload;
    User.findById(_id).then((userData) => {
      request.user = userData;
      next();
    });
  });
};
