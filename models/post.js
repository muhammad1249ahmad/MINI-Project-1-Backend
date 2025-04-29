const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  content: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("post", postSchema);
