const exp = require('constants')
const express = require('express')
const app = express()
const fs = require('fs')

const port = 3001

app.use('/', express.static('node_modules'))

app.get('/images*', (req, res) => {
    var name = req.url.split('/')[2]
    fs.readFile('images/' + name, function (err, data) {
        if (err) return console.error(err)
        //console.log(data.toString())
        res.write(data)
        res.end()
    })
})

app.get('/', (req, res) => {
    
    fs.readFile('login.html', function (err, data) {
        if (err) return console.error(err)
        //console.log(data.toString())
        res.write(data)
        res.end()
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})