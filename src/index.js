const express = require('express');
const app = express();
//const cookieParser = require("cookie-parser");

const mysql = require("mysql");
//var session = require('express-session');

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
  });

const basics = require("./routes/basics");
const login = require("./routes/login");
const cors = require("cors");

//app.use(cookieParser())
app.use(cors());

app.use(express.json());

app.use("/api/eco/v1/data", basics);
app.use("/api/eco/v1/login", login);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header('Access-Control-Allow-Credentials', "*");
  res.header('Access-Control-Expose-Headers', 'x-access-token'); //essta linha habilita o token no header
  next();
});

const port = process.env.PORT || 2500;

app.listen(port, ()=>[
    console.log(`app is working, on port ${port}...`)
])