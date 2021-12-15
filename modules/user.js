const mongoose = require("./db.js")

const UserSchema = {
    username: String,
    password: String,
    num: String,
    sex: String,
    birthday: Date,
    major: String,
    email: String,
    hobbies: String,
    regtime: Date,
    headimg: String
}

const User = mongoose.model("User", UserSchema, "users")

module.exports = User