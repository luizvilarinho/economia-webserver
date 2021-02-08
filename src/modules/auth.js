const express = require("express");

const config = require('../config');
const jwt = require("jsonwebtoken");

var environment = 'prod';

var SECRET = "mysecret";


function auth(req, res, next){
    const authResponse = {};
    const token = req.headers['x-access-token'];
    config.token = token;
    console.log("token", token);

   

    if(!token){
        authResponse.message = 'access denied. No token provided.';
        authResponse.redirect = config[environment].urlLogin;
        console.log("erro");
        res.status(400).json(authResponse);
    } 

    if(token){
        console.log("sucesso");
        config.userId = jwt.verify(token, SECRET).id;
        console.log("config", config);

        next();
    }
    
}

module.exports = auth;