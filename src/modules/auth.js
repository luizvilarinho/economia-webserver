const express = require("express");
const app = express();

const config = require('../config');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser())

var environment = 'prod';

var SECRET = "mysecret";

function auth(req, res, next){
    const authResponse = {};
    const token = config.token;

    console.log("config.token", config.token);

    authResponse.message = 'access denied. No token provided.';
    authResponse.redirect = config[environment].urlLogin;

    if(!token) res.json(authResponse);

    try{
        config.user_id = jwt.verify(token, SECRET).id;
        //req.user_id = decoded;
        next();
    }
    catch(ex){
        authResponse.message = "Invalid token";
        res.status(400).json(authResponse);
    }
}

module.exports = auth;