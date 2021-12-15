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
const { ServerResponse } = require('http')

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
    
    Service.User.findOne({"username": username, "password": password}, (err, user) =>{
        if(err) return console.log(err)
        if(!user) res.render("login.ejs", {info: "用户名或密码错误"})
        else {
            Service.Publish.find({}, (err, publishList) => {
                if(err) return console.log(err)
                req.session.user = user
                res.render("home.ejs", {
                    user: user,
                    publishList: publishList
                })
            })
        }
    })
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
    var birthday = req.body.birth
    var major = req.body.major
    var email = req.body.email
    var hobbies = req.body.hobbies
    var headimg = headimg_default
    if(req.file != null) headimg = req.file.filename
    hobbies = hobbies + ""
    var regtime = Service.GetTime()
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
    var time = Service.GetTime()
    Service.InsertPublish(user.username, publishimg, text, time)
    res.render("publish.ejs", {
        user: user,
        text: text,
        info: "发布成功！"
    })
})

app.get("/home.ejs", (req, res) => {
    var user = req.session.user
    res.render("home.ejs", {
        user: user
    })
})

app.use((req, res) => { //错误处理
    res.status(404).send(req.url + 'not found');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})