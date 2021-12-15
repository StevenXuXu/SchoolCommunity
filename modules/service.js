const User = require("./user")
const Publish = require("./publish")
const Follow = require("./follow")
const Comment = require("./comment")

//在user表中插入数据
function InsertUser(username, password, num, sex, birthday, major, email, hobbies, regtime, headimg) {
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

function InsertPublish(username, img, text, time) {
    var publish = new Publish({
        username: username,
        img: img,
        text: text,
        time: time
    })
    publish.save((err) => {
        if(err) return console.log(err)
        console.log("插入publish成功")
    })
}

function GetTime() {
    var d = new Date()
    var time = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    return time
}

module.exports = {User, Publish, InsertUser, InsertPublish, GetTime}

/*
async.series({
    func1: function(cb) {
        req.session.user = user
        cb(null, null)
    },
    func2: function(cb) {
        cb(null, null)
    }
}, function(err, result) {
    if(err) return console.log(err)
    res.render("home.ejs", {
        user: user
    })
})
*/