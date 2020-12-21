const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

const mysql = require("mysql");
var session = require('express-session');

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
  });

const basics = require("./routes/basics");
const login = require("./routes/login");

const bodyParser = require("body-parser");
const cors = require("cors");

var SECRET = "mysecret";

var corsOptions = {
  origin: 'http://luizvilarinho.com.br',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, PUT"
}

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(cors({origin: '*'}));
app.use(express.json());

app.use(session({
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json());


app.use("/api/eco/v1/data", basics);
app.use("/api/eco/v1/login", login);


const port = process.env.PORT || 2500;

app.listen(port, ()=>[
    console.log(`app is working, on port ${port}...`)
])