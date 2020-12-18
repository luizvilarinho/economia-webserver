const express = require('express');
const app = express();

const mysql = require("mysql");

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
  });

const basics = require("./routes/basics");


const bodyParser = require("body-parser");
const cors = require("cors");


//app.use(cors());
app.use(cors({origin: 'http://www.luizvilarinho.com.br'}));
app.use(express.json());
app.use(bodyParser.json());


app.use("/api/eco/v1/data", basics)



const port = process.env.PORT || 2500;

app.listen(port, ()=>[
    console.log(`app is working, on port ${port}...`)
])