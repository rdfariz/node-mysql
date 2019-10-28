var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mysql = require('mysql')
var fs = require('fs')
var store = require('store')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node"
});

con.connect(function (err){
    if(err) throw err;
});

function print(val, res){
    var data = {
        'status': 200,
        'values': val
    }
    res.json(data);
    res.end();
}

app.get('/',(req, res)=>{
    res.redirect('/signin')
})
app.get('/dashboard', (req, res, next)=>{    
    if(store.get('user') == null) {
        res.redirect('/signin')
        res.end();
    }else {
        res.send('Login as <b>'+store.get('user')+'</b><br><a href="/logout">Logout</a>');
        next();
    }
})
app.get('/logout',(req, res)=>{
    store.clearAll()
    res.redirect('/');
})
app.get('/signin', (req,res)=>{
    fs.readFile('index.html', (err, data)=>{
        if (store.get('user')) {
            res.redirect('/dashboard');
            res.end();
        }else {
            res.write(data);
            res.end();
        }
    })
})
app.post('/signup', (req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    con.query('INSERT INTO users (username, password) VALUES(?,?)',[username,password], (err, rows, fields)=>{
        if (err == null) {
            res.send('Berhasil membuat akun<br><a href="/">Login disni</a>')
        }else {
            res.send('Kesalahan membuat akun<br><a href="/">Login disni</a>')
        }
        res.end();     
    })
})
app.post('/signin', (req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    con.query('SELECT * FROM users WHERE username=? AND password=?',[username, password], (err, rows, fields)=>{
        if (rows.length == 1) {
            store.set('user', username)
            res.redirect('/dashboard');
        }else {
            res.redirect('/signin')
        }
        res.end();
    })
})

app.listen(8080)
console.log('Running in port 8080');