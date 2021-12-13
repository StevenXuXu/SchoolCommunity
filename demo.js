const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const multer  = require('multer')
const path  = require('path')
const User = require("./modules/user")

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

app.get('/', (req, res) => {
    res.render('login.ejs')
})

app.get('/login.ejs', (req, res) => { //登陆
    res.render('login.ejs')
})

app.post('/doLogin', (req, res) => {
    var username = req.body.inputusername
    var password = req.body.inputpassword
    req.session.username = username
    res.send(req.body)
})

app.get('/logOut', (req, res) => { //退出
    req.session.username = ""
    res.send('logout')
})

app.use('/haha', (req, res) => {
    var username = req.session.username
    if(!username) res.send('nonono')
    else res.send(username)
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
    var d = new Date()
    var regtime = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate()
    User.insert(username, password, num, sex, birthday, major, email, hobbies, regtime, headimg)
    res.send({
        birthday: birthday,
        regtime: regtime
    })
})

app.use((req, res) => { //错误处理
    res.status(404).send(req.url + 'not found');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})