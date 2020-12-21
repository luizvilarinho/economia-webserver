const express = require("express");
const app = express();

const config = require('../config');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser())

var environment = 'prod';

function auth(req, res, next){
    const authResponse = {};
    const token = config.token;

    authResponse.message = 'access denied. No token provided.';
    authResponse.redirect = config[environment].urlLogin;
    if(!token) res.json(authResponse);

    try{
        user_id = jwt.verify(token, "mysecret").id;
        //req.user_id = decoded;
        next();
    }
    catch(ex){
        authResponse.message = "Invalid token";
        res.status(400).json(authResponse);
    }
}

module.exports = auth;