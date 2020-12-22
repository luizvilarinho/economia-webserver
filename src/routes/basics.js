const express = require("express");
const basics = express.Router();

const config = require('../config');
const somarValores = require("../modules/somarValores");
const monthFilter = require("../modules/monthFilter");
const auth = require('../modules/auth');

const mysql = require("mysql");

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
});

var data = {};


const tipoDespesa={
    despesasFixas: {
        nome:"despesa_fixa",
        id:1
    },
    despesasVariaveis:{
        nome:"despesa_variavel",
        id:2
    },
    entradas:{
        nome:"entrada",
        id:3
    }
}

basics.get("/getcookie", auth, async(req, res)=>{
    var responseObj = {
        cookies:req.cookies,
        userID:user_id
    }
    res.json(responseObj);
})

basics.get("/", auth,  async (request, response)=>{
    response.header("Access-Control-Allow-Origin", "*");
    response.header('Access-Control-Allow-Credentials', true);

    const { mes } = request.query;
    //console.log("mes", mes);
    
    /**get data from table*/
    
    console.log("USERID",config.userId)
     pool.getConnection(async (err, connection) => {
        if(err) throw err;
        
        let queryDespesasFixas = `SELECT * FROM eco_data WHERE id_despesa = 1 and user_id = ${config.userId}`;

        connection.query(queryDespesasFixas, (error, result)=> {
            if (error) throw error;
            
            data.despesasFixas = result;
            
        });

        let queryDespesasVariaveis = `SELECT * FROM eco_data WHERE id_despesa = 2 and user_id = ${config.userId}`;

        connection.query(queryDespesasVariaveis, (error, result)=> {
            if (error) throw error;
            
            data.despesasVariaveis = result;
            
            //console.log("DESPESAS Variaveis", data);
            //db.destroy();
        
        });

         let queryEntradas = `SELECT * FROM eco_data WHERE id_despesa = 3 and user_id = ${config.userId}`;

         connection.query(queryEntradas, (error, result)=> {
            if (error) throw error;
            
            data.entradas = result;
            
            if(mes){
                let dataReturn= monthFilter(mes);
        
                //console.log("dataReturn", dataReturn)
        
                let consolidado = somarValores(dataReturn);
                dataReturn.consolidado = consolidado;
        
                dataReturn.success = true;
                dataReturn.message = "successful filter";
                response.json(dataReturn);
        
                return
            }
            
        
            data.success = true;
            data.message = "successful request";
            response.json(data)
            //db.destroy();
        });

        connection.release();

    })
        /*get data from table*/
    

    
})

basics.get("/:bloco", (request, response)=>{

    let { bloco } = request.params;

    var bl = data[bloco];
    response.json(bl)
})

basics.post("/", auth, (request, response) =>{
    let { bloco, nome, valor, mes } = request.body;

    var includeObj = {
        nome,
        valor,
        mes,
        id:parseInt(Math.random() * 1000),
        tipo_despesa: tipoDespesa[bloco].nome,
        id_despesa: tipoDespesa[bloco].id,
        user_id:config.userId
    }


   // data[bloco].push(includeObj);

   pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let createItem = `INSERT INTO eco_data (nome, valor, mes, id, tipo_despesa, id_despesa, user_id) VALUES ('${includeObj.nome}', '${includeObj.valor}', '${includeObj.mes}', '${includeObj.id}', '${includeObj.tipo_despesa}', '${includeObj.id_despesa}', '${includeObj.user_id}')`;

        connection.query(createItem, (error, result)=> {
            if (error) throw error;
            
            includeObj.success=true;
            includeObj.message= "all right, you include your data!";

            response.json(includeObj)
            
        });

        connection.release();
    })

   
})

basics.put("/:id", (request, response)=>{
    const { nome, valor, mes } = request.body;
    const { id } = request.params;
    var responseObj = {};

    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let updateQuery = `UPDATE eco_data SET nome = '${nome}', valor = '${valor}', mes='${mes}' WHERE user_id = '${config.userId}' and id = '${id}'`;

        connection.query(updateQuery, (error, result)=> {
            if (error) throw error;
            
           
            responseObj.success = true;
            responseObj.message = "item changed successfully ";
            responseObj.response = result;

            response.json(responseObj);
            
        });

        connection.release();
    })

    
/** if(isChanged == false){
        let responseObj = {
            success:false,
            message:"not find itens with the given id"
        }
        return response.json(responseObj);
    } */
    

    });

basics.delete("/:id", auth, (request, response)=>{
    response.header("Access-Control-Allow-Origin", "*");
    response.header('Access-Control-Allow-Credentials', true)

    const { id } = request.params;
    var responseObj = {};
    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let deleteitem = `DELETE FROM eco_data WHERE user_id = ${config.userId} and id = ${id}`;

        connection.query(deleteitem, (error, result)=> {
            if (error) throw error;
            
            //console.log("result", result)
            responseObj.success = true;
            responseObj.message = "item successful deleted";

            response.json(responseObj)
            
        });

        connection.release();
    })
    /*
    let df = data.despesasFixas.filter(el=>el.id != id);
    let dv = data.despesasVariaveis.filter(el=>el.id != id);
    let e = data.entradas.filter(el=>el.id != id);
    
    data.despesasFixas = df;
    data.despesasVariaveis = dv;
    data.entradas = e;

    */
})


module.exports = basics;