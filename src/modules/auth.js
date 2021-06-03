const config = require('../config');
const jwt = require("jsonwebtoken");

var environment = 'dev';

var SECRET = "mysecret";


function auth(req, res, next){
    const authResponse = {};
    const token = req.headers['x-access-token'];
    config.token = token;
    //console.log("token", token);

   

    if(!token){
        console.log("teste 1")
        authResponse.message = 'access denied. No token provided2.';
        authResponse.redirect = config[environment].urlLogin;
        //console.log("erro");
        res.status(400).json(authResponse);
    } 

    if(token){
        
        jwt.verify(token, SECRET, function(err){
            if(err){
                console.log("ERRO!", err)
                authResponse.message = 'err.message';
                authResponse.redirect = config[environment].urlLogin;
                res.status(400).json(authResponse);
                return
            }else{
                config.userId = jwt.verify(token, SECRET).id;
            } 

        })
       

        next();
    }
    
}

module.exports = auth;