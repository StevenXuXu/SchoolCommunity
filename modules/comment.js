const mongoose = require("./db.js")

const CommentSchema = {
    p_id: String,
    username: String,
    comment: String,
    time: Date
}

const Comment = mongoose.model("Comment", CommentSchema, "comments")

module.exports = Comment