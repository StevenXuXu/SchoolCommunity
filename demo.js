const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const multer  = require('multer')
const path  = require('path')
const port = 3001

app.set('view engine', 'ejs')//将ejs集成到express中

app.use(express.static('static'))
app.use(express.static('node_modules'))
app.use(bodyParser.urlencoded({ extended: false }))
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'static/upload')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      var extname = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extname)
    }
  })

app.get('/', (req, res) => {
    res.render('login.ejs')
})

app.get('/login.ejs', (req, res) => {
    res.render('login.ejs')
})

app.post('/doLogin', (req, res) => {
    var username = req.body.inputusername
    var password = req.body.inputpassword
    req.session.username = username
    res.send(username + ' ' + password)
})

app.get('/logOut', (req, res) => {
    req.session.username = ""
    res.send('logout')
})

app.use('/haha', (req, res) => {
    var username = req.session.username
    if(!username) res.send('nonono')
    else res.send(username)
})

app.get('/reg.ejs', (req, res) => {
    res.render('reg.ejs')
})

app.use((req, res) => {
    res.status(404).send(req.url + 'not found');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})