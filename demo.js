const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const port = 3001

app.set('view engine', 'ejs')//将ejs集成到express中

app.use(express.static('static'))
app.use(express.static('node_modules'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    
    res.render('login.ejs')
})
app.get('/login.ejs', (req, res) => {
    
    res.render('login.ejs')
})

app.get('/reg.ejs', (req, res) => {
    res.render('reg.ejs')
})

app.use((req, res) => {
    res.status(404).send("404 NOT FOUND");
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})