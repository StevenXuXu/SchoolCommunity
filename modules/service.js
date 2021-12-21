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

function InsertComment(p_id, username, headimg, comment, time) {
    var comment = new Comment({
        p_id: p_id,
        username: username,
        headimg: headimg,
        comment: comment,
        time: time
    })
    comment.save((err) => {
        if(err) return console.log(err)
        console.log("插入comment成功")
    })
}

function trans(x) {
    if(x < 10) x = "0" + x;
    return x
}

function GetRegTime() {
    var d = new Date()
    var time = trans(d.getFullYear()) + "-" + trans(d.getMonth()) + "-" + trans(d.getDate())
    return time
}

function GetPublishTime() {
    var d = new Date()
    var time = trans(d.getFullYear()) + "-" + trans(d.getMonth()) + "-" + trans(d.getDate()) + " " + trans(d.getHours()) + ":" + trans(d.getMinutes()) + ":" + trans(d.getSeconds())
    return time
}

function calMostPage(sum) {
    var most = 0
    while(sum > 10) {
        sum -= 10
        most++
    }
    if(sum > 0) most++
    return most
}

module.exports = {User, Publish, Comment, InsertUser, InsertPublish, GetRegTime, GetPublishTime, InsertComment, calMostPage}

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