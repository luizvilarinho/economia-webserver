const express = require("express");

const config = require('../config');
const jwt = require("jsonwebtoken");

var environment = 'prod';

var SECRET = "mysecret";


function auth(req, res, next){
    const authResponse = {};
    const token = req.headers['x-access-token'];

    console.log("token", token);

    authResponse.message = 'access denied. No token provided.';
    authResponse.redirect = config[environment].urlLogin;

    if(!token) res.json(authResponse);

    try{
        config.userId = jwt.verify(token, SECRET).id;
        console.log("config", config);

        next();
    }
    catch(ex){
        authResponse.message = "Invalid token";
        res.status(400).json(authResponse);
    }
}

module.exports = auth;