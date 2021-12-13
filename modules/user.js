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

function insert(username, password, num, sex, birthday, major, email, hobbies, regtime, headimg) {
    var user = new User({
        username: username,
        password: password,
        num: num,
        sex: sex,
        birthday: birthday,
        major: major,
        email: email,
        hobbies: hobbies,
        regtime: regtime,
        headimg: headimg
    })
    user.save((err) => {
        if(err) return console.log(err)
        console.log("插入user成功")
    })
}

module.exports = {insert}