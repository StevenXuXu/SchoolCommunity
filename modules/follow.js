const mongoose = require("./db.js")

const FollowSchema = {
    username: String,
    follow: String
}

const Follow = mongoose.model("Follow", FollowSchema, "follows")

module.exports = Follow