const mongoose = require("./db.js")

const PublishSchema = {
    username: String,
    img: String,
    text: String,
    time: Date
}

const Publish = mongoose.model("Publish", PublishSchema, "publishes")

module.exports = Publish