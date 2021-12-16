const mongoose = require("./db.js")
var ObjectId = require('mongodb').ObjectId

const CommentSchema = {
    p_id: ObjectId,
    username: String,
    comment: String,
    time: String,
    headimg: String
}

const Comment = mongoose.model("Comment", CommentSchema, "comments")

module.exports = Comment