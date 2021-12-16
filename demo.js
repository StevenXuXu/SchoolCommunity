const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const multer  = require('multer')
const path  = require('path')
const Service = require("./modules/service.js")
const async = require('async');
var ObjectId = require('mongodb').ObjectId
const { ServerResponse } = require('http')
const { callbackify } = require('util')
const { Serializer } = require('v8')

const port = 60531
const headimg_default = "default.jpg"

app.set('view engine', 'ejs')//将ejs集成到express中

app.use(express.static('static'))
app.use(express.static('node_modules'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser('jiami'))
app.use(session({
    secret: 'this is a session', //服务器生成session签名
    name: 'username',
    resave: false, //强制保存session即使他没有变化
    saveUninitialized: true, //强制保存未初始化的session
    cookie: {
        maxAge: 1000 * 60 * 15
    },
    rolling: true
}))
const storage = multer.diskStorage({ //设置文件保存格式
    destination: function (req, file, cb) {
      cb(null, 'static/upload')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      var extname = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + extname)
    }
})
const upload = multer({ storage: storage })

var nowuser = null

app.get('/', (req, res) => {
    res.render('login.ejs', {info: null})
})

app.get('/login.ejs', (req, res) => { //登陆
    res.render('login.ejs', {info: null})
})

app.post('/doLogin', (req, res) => {
    var username = req.body.inputusername
    var password = req.body.inputpassword
    Service.User.findOne({"username": username, "password": password}).exec((err, user) => {
        if(err) return console.log(err)
        if(!user) res.render("login.ejs", {info: "用户名或密码错误"})
        else {
            req.session.user = user
            Service.Publish.aggregate([
            {
                $lookup: {
                from: "users",
                localField: "username",
                foreignField: "username",
                as: "user"
                }
            },
            {
                $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "p_id",
                as: "comment"
                }
            },
            {
                $sort: {"time":-1}
            }
            ],function(err,docs){
                if(err) return console.log(err)
                req.session.page = 1
                var most = Service.calMostPage(docs.length)
                req.session.mostPage = most
                req.session.publishList = docs
                res.render("home.ejs", {
                    user: user,
                    publishList: docs,
                    page: 1,
                    mostPage: most
                })
            })
        }
    })
})

app.use((req, res, next) => {
    var user = req.session.user
    if(user == null) res.render('login.ejs', {info: null})
    else next()
})

app.get('/logOut', (req, res) => { //退出
    req.session.username = ""
    res.render("login.ejs", {info: null})
})

app.get('/reg.ejs', (req, res) => { //注册
    res.render('reg.ejs')
})

app.post('/doReg', upload.single('headimg'), (req, res) => {
    var username = req.body.inputusername
    var password = req.body.inputpassword
    var num = req.body.num
    var sex = req.body.sex
    if(sex == "1") sex = "男"
    else sex = "女"
    var birthday = req.body.birth
    var major = req.body.major
    var email = req.body.email
    var hobbies = req.body.hobbies
    var headimg = headimg_default
    if(req.file != null) headimg = req.file.filename
    hobbies = hobbies + ""
    var regtime = Service.GetRegTime()
    Service.InsertUser(username, password, num, sex, birthday, major, email, hobbies, regtime, headimg)
    res.render("login.ejs", {info: "注册成功！"})
})

app.get("/publish.ejs", (req, res) => {
    var user = req.session.user
    res.render("publish.ejs", {
        user: user,
        text: null,
        info: null
    })
})

app.post("/doPublish", upload.single('publishimg'), (req, res) => {
    var user = req.session.user
    var text = req.body.text
    var publishimg = null
    if(req.file != null) publishimg = req.file.filename
    var time = Service.GetPublishTime()
    Service.InsertPublish(user.username, publishimg, text, time)

    Service.Publish.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user"
        }
    },
    {
        $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "p_id",
            as: "comment"
        }
    },
    {
        $sort: {"time":-1}
    }
    ],function(err,docs){
        if(err)  return console.log(err)
        req.session.mostPage = Service.calMostPage(docs.length)
        req.session.publishList = docs
        res.render("publish.ejs", {
            user: user,
            text: text,
            page: req.session.page,
            mostPage:req.session.mostPage,
            info: "发布成功！"
        })
    })
    
})

app.get("/home", (req, res) => {
    var page = req.query.page
    req.session.page = page
    var user = req.session.user
    Service.Publish.aggregate([
    {
        $lookup: {
        from: "users",
        localField: "username",
        foreignField: "username",
        as: "user"
        }
    },
    {
        $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "p_id",
        as: "comment"
        }
    },
    {
        $sort: {"time":-1}
    }
    
    ],function(err,docs){
        if(err) return console.log(err)
        req.session.publishList = docs
        req.session.mostPage = Service.calMostPage(docs.length)
        res.render("home.ejs", {
            user: user,
            publishList: docs,
            page: req.session.page,
            mostPage: req.session.mostPage
        })
    })
})

app.get("/userInfo", (req, res) => {
    var user = req.session.user
    var username = req.query.username
    Service.User.findOne({"username": username}, (err, lookUser) =>{
        if(err) return console.log(err)
        res.render("userInfo.ejs", {
            user: user,
            lookUser: lookUser
        })
    })
})

app.post("/doComment", (req, res) => {
    var user = req.session.user
    var p_id = ObjectId(req.query.id)
    var comment = req.body.comment
    var time = Service.GetPublishTime()
    Service.InsertComment(p_id, user.username, user.headimg, comment, time)
    Service.Publish.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user"
        }
    },
    {
        $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "p_id",
            as: "comment"
        }
    },
    {
        $sort: {"time":-1}
    }
    ],function(err,docs){
        if(err)  return console.log(err)
        req.session.publishList = docs
        res.render("home.ejs", {
            user: user,
            publishList: docs,
            page: req.session.page,
            mostPage: req.session.mostPage
        })
    })
        
})

app.get("/userList.ejs", (req, res) => {
    var user = req.session.user
    Service.User.find({}, (err, docs) => {
        if(err)  return console.log(err)
        res.render("userList.ejs", {
            user: user,
            userList: docs
        })
    })
})

app.get("/searchUser", (req, res) => {
    var user = req.session.user
    var search = req.query.search
    var query = {}
    query["username"] = new RegExp(search)
    Service.User.find(query, (err, docs) => {
        if(err)  return console.log(err)
        res.render("userList.ejs", {
            user: user,
            userList: docs
        })
    })
})

app.get("/findByUser", (req, res) => {
    var username = req.query.username
    var user = req.session.user
    var publishList = req.session.publishList
    res.render("findPublishes.ejs", {
        user: user,
        findByUser: username,
        publishList: publishList
    })
})

app.get("/delPublish", (req, res) => {
    var id = req.query.id
    Service.Publish.deleteOne({"_id": ObjectId(id)}, (err) => {})
    req.session.page = 1
    var user = req.session.user
    Service.Publish.aggregate([
    {
        $lookup: {
        from: "users",
        localField: "username",
        foreignField: "username",
        as: "user"
        }
    },
    {
        $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "p_id",
        as: "comment"
        }
    },
    {
        $sort: {"time":-1}
    }
    
    ],function(err,docs){
        if(err) return console.log(err)
        req.session.publishList = docs
        req.session.mostPage = Service.calMostPage(docs.length)
        res.render("home.ejs", {
            user: user,
            publishList: docs,
            page: req.session.page,
            mostPage: req.session.mostPage
        })
    })
})

app.get("/delComment", (req, res) => {
    var id = req.query.id
    Service.Comment.deleteOne({"_id": ObjectId(id)}, (err) => {})
    req.session.page = 1
    var user = req.session.user
    Service.Publish.aggregate([
    {
        $lookup: {
        from: "users",
        localField: "username",
        foreignField: "username",
        as: "user"
        }
    },
    {
        $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "p_id",
        as: "comment"
        }
    },
    {
        $sort: {"time":-1}
    }
    
    ],function(err,docs){
        if(err) return console.log(err)
        req.session.publishList = docs
        req.session.mostPage = Service.calMostPage(docs.length)
        res.render("home.ejs", {
            user: user,
            publishList: docs,
            page: req.session.page,
            mostPage: req.session.mostPage
        })
    })
})

app.get("/haha", (req, res) => {
    Service.Publish.aggregate([
        {
            $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user"
            }
        },
        {
            $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "p_id",
            as: "comment"
            }
        },
        {
            $sort: {"time":-1}
        },
        {
            username: "admin"
        }
        
        ],function(err,docs){
            if(err) return console.log(err)
            res.send(docs)
        })
})

app.use((req, res) => { //错误处理
    res.status(404).send(req.url + 'not found');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})