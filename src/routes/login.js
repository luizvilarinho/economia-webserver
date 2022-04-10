const express = require("express");
const login = express.Router();
const auth = require('../modules/auth');

const config = require('../config');
const jwt = require("jsonwebtoken");

const mysql = require("mysql");
const nodemailer = require('nodemailer');
const templateEmail = require('../modules/emailTemplate');

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
});

var SECRET = "mysecret";

//email configuration
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "contato@luizvilarinho.com.br",
        pass: "Batata.33"
    },
    tls: { rejectUnauthorized: false }
  });

const mailOptions = {
    from: 'contato@luizvilarinho.com.br',
    to: '',
    subject: 'recuperação de senha appdespesas',
    html: ''
};


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

               var token = jwt.sign({id:user[0].id}, SECRET, {
                    expiresIn:"5d"
                });

                objRespopnse = {
                    success : true,
                    findUser: true,
                    correctPassword: true,
                    name:user[0].name,
                    email:user[0].email,
                    user_id:user[0].id,
                    auth:true,
                    token,
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

/*login.get("/users", (request, response)=>{

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
*/


login.get("/users/getlogueduser", auth, (request, response)=>{
    /**Comment */
    response.header("Access-Control-Allow-Origin", "*");
    response.header('Access-Control-Allow-Credentials', true);
    var responseObj = {};

    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let query = `SELECT * FROM users WHERE id = '${config.userId}'`;

        connection.query(query, (error, result)=> {
             if (error) throw error;
             

             if(result.length == 0){
                responseObj.success = false;
                responseObj.message = "user not found";
                response.json(responseObj);
             }else{
                
                responseObj.success = true;
                responseObj.message = "user founded";
                responseObj.userName = result[0].name;
                responseObj.userEmail = result[0].email;
                response.json(responseObj);
             }
             connection.release();  
            
        });

    })
})

login.post("/user/create", (request, response)=>{
    const { name, email, password  } = request.body;
    

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

login.post("/user/sendemail", (request, response)=>{
    let { email } = request.body;

    //localizar dados do usuario
    pool.getConnection((err, connection)=>{
        if(err) throw err;

        let findUserByEmailQuery = `SELECT name, email FROM users WHERE email = '${email}'`;

        connection.query(findUserByEmailQuery, (err, user)=>{
            if(err) throw err;

            if(user){

                //enviar email com o link para troca de senha           
                mailOptions.to = email;
                mailOptions.html = templateEmail(user[0].name, user[0].email);
                transporter.sendMail(mailOptions, function(error, info){
                    
                    if (error) console.log(error)
                      
                        response.json({
                            success:true,
                            message:"email enviado com sucesso"
                        })
                  });

                
            }else{
                response.json({message:"user not found", success:false})
            }
        })
    })
    

    
});

//todo
login.put("/user/changepassword", (request, response)=>{
    
    let { novaSenha, tokenUrl } = request.body;
    let email = Buffer.from(tokenUrl, 'hex').toString('utf8').replace("=", "").trim();

    console.log("CHANGESENHA",novaSenha, tokenUrl, email)

    if(!novaSenha){
        response.json({success:false, message: "O usuário edve informara nova senha"})
    }

    //localizar usuario e alterar senha antiga pela nova senha

    pool.getConnection((err, connection)=>{
        if(err) throw err;

        let findUserByEmailQuery = `SELECT name, email FROM users WHERE email = '${email}'`;

        connection.query(findUserByEmailQuery, (err, user)=>{
            if(err) throw err;

            console.log("USER", user)
            if(user){

                console.log("SENHA", novaSenha, "EMAIL", email)
                let updateQuery = `UPDATE users SET password = ${novaSenha} WHERE email = '${email}'`
                
                connection.query(updateQuery,(err, resp)=>{
                    if(err) console.log(err)

                    response.json({
                        success:true,
                        message:"senha alterada com sucesso"
                    })
                })
                
            }else{
                response.json({message:"user not found", success:false})
            }
        })
    })
})


module.exports = login;