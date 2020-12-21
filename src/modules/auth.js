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
    const token = req.session.ecoUserToken;

    console.log("token", token);

    authResponse.message = 'access denied. No token provided.';
    authResponse.redirect = config[environment].urlLogin;

    if(!token) res.json(authResponse);

    try{
        req.session.userId = jwt.verify(token, SECRET).id;
        //req.user_id = decoded;
        next();
    }
    catch(ex){
        authResponse.message = "Invalid token";
        res.status(400).json(authResponse);
    }
}

module.exports = auth;