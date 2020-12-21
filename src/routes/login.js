const express = require("express");
const login = express.Router();

const jwt = require("jsonwebtoken");

const mysql = require("mysql");

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
});

var SECRET = "mysecret";

login.post("/user/login", (request, response) =>{
    const { email, password } = request.body;
    var objRespopnse = {};

    let findUserQuery = `SELECT * FROM users WHERE email = '${email}'`;
    
    pool.getConnection((err, connection)=>{
        if(err) throw err;

        connection.query(findUserQuery, (err, user)=>{
            if(err) throw err;

            if(user.length == 0){
    
                objRespopnse = {
                    success : false,
                    findUser: false,
                    correctPassword: false,
                    message:"usuário não encontrado"
                }
                connection.release();


                return response.json(objRespopnse);
            }
            
            if(user[0].password === password){

                const token = jwt.sign({id:user[0].id}, SECRET, {
                    expiresIn:"30d"
                });

                response.cookie('eco-user-token', token, { maxAge: 900000, httpOnly: true });
                
                objRespopnse = {
                    success : true,
                    findUser: true,
                    correctPassword: true,
                    name:user[0].name,
                    email:user[0].email,
                    user_id:user[0].id,
                    auth:true,
                    token:token,
                    message:"usuário encontrado",
                    cookies:request.cookies
                }


                connection.release();

                response.json(objRespopnse) 
            }else{
                objRespopnse = {
                    success : true,
                    findUser: true,
                    correctPassword: false,
                    message:"Senha incorreta"
                }
                connection.release();
                response.json(objRespopnse) 
            }

        })
    })
})

login.get("/users", (request, response)=>{

    pool.getConnection((err, connection) => {
            if(err) throw err;
            
            let query = "SELECT * FROM users";
            var responseObj={};

            connection.query(query, (error, result)=> {
                 if (error) throw error;
                 
                 responseObj = result;

                 
                 connection.release();
                 response.json(responseObj);
            });

        })
})

login.get("/users/getuserbyid/:id", (request, response)=>{
    const  id = request.params.id
    var responseObj = {};

    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let query = `SELECT * FROM users WHERE id = '${id}'`;

        connection.query(query, (error, result)=> {
             if (error) throw error;
             

             if(result.length == 0){
                responseObj.success = false;
                responseObj.message = "user not found";
                response.json(responseObj);
             }else{
                connection.release();
                response.json(result[0]);
             }
                         
            
        });

    })
})

login.post("/user/create", (request, response)=>{
    const { name, email, password  } = request.body;
    
    var responseObj={};

    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        var responseObj={};

        let checkEmailQuery = `SELECT * FROM users WHERE email = '${email}'`;

        connection.query(checkEmailQuery, (error, result)=>{
            if (error) throw error;


            if(result.length > 0){
                responseObj.success = false;
                responseObj.message = "e-mail já cadastrado.";

                 return response.json(responseObj);
            }

            if(result.length == 0){
                let query = `INSERT INTO users (name, email, password) VALUES('${name}','${email}','${password}')`;

                connection.query(query, (error, result)=> {
                    if (error) throw error;
                    
                    responseObj.user = {name, email, password};
                    responseObj.success = true;
                    responseObj.message = "user created";
                    
                    //db.destroy();
                    connection.release();
                    response.json(responseObj);
               })
            }
        })
    })

})


login.delete("/user/delete/:id", (req, response)=>{
    const  id = req.params.id
    var responseObj = {};
    pool.getConnection((err, connection)=>{
        if (err) throw error;
        let findUserQuery = `DELETE FROM users WHERE id = '${id}'`;
        connection.query(findUserQuery, (err, user)=>{
            if (err) throw error;

            connection.release();
            responseObj.success = true;
            responseObj.message = "user deleted"
            response.json(responseObj);
        })
    })
})


module.exports = login;