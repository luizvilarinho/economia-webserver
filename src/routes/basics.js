const express = require("express");
const basics = express.Router();

const config = require('../config');
const auth = require('../modules/auth');
var uniqid = require('uniqid');

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

basics.get("/", auth,  async (request, response)=>{

    const { mes, ano } = request.query;

    /**get data from table*/
    
    if(mes){
       var queryMes = `and mes = ${mes}`
    }else{
        var queryMes = ""
    }

    data = {};
    pool.getConnection(async (err, connection) => {
        if(err) throw err;
        
        let queryDespesas = `SELECT * FROM eco_data WHERE user_id = ${config.userId} and ano=${ano}`;

        connection.query(queryDespesas, async (error, result)=> {
            if (error) throw error;
            
            data.despesasFixas = await result.filter(despesa=>{
                return despesa.id_despesa == 1 && despesa.mes == mes
            })

            console.log("data.despesasFixas", data.despesasFixas)
            if(data.despesasFixas.length === 0){
                var maiorMes = 1;
                result.map(despesa=>{
                    if(despesa.mes > maiorMes){
                        maiorMes = despesa.mes
                    }
                })

                var ultimaDespesaFixa = result.filter(despesa=>{
                    return despesa.id_despesa == 1 && despesa.mes == maiorMes
                })

                
                for(let i = 0; i < ultimaDespesaFixa.length; i++){
                    data.despesasFixas.push(ultimaDespesaFixa[i])
                    ultimaDespesaFixa[i].mes = mes;

                    var uniqId = uniqid();
                    var includeObj = {
                        nome: ultimaDespesaFixa[i].nome,
                        valor: ultimaDespesaFixa[i].valor,
                        mes,
                        id: uniqId,
                        tipo_despesa: 'despesa_fixa',
                        id_despesa: 1,
                        user_id:config.userId
                    }

                    console.log("includeObj", includeObj)
                    let createItem = `INSERT INTO eco_data (nome, valor, mes, id, tipo_despesa, id_despesa, user_id) VALUES ('${includeObj.nome}', '${includeObj.valor}', '${includeObj.mes}', '${includeObj.id}', '${includeObj.tipo_despesa}', '${includeObj.id_despesa}', '${includeObj.user_id}')`;

                    connection.query(createItem, (error, ultimaDespesa)=> {
                        if(error) console.log(error)
                        
                        console.log("ultimaDespesa", ultimaDespesa)
                    })
                }
            }
            
            data.despesasVariaveis= result.filter(despesa=>{
                return despesa.id_despesa == 2 && despesa.mes == mes
            })

            data.entradas = result.filter(entrada=>{
                return entrada.id_despesa == 3 && entrada.mes == mes
            })
            

            connection.release();

           response.json(data)

         })
        /*get data from table*/
    })
})

basics.get("/dominio/ano", auth, async(req, res)=>{
    pool.getConnection(async (err, connection) => {

        let queryAnos = `SELECT DISTINCT ano FROM eco_data WHERE user_id = ${config.userId}`;

        connection.query(queryAnos, async (error, anos)=> {
            if(error) console.log(error)

            let anosList = anos
                .map(ano=>{
                     return ano.ano
                })
                .sort((a,b)=> {return b-a})
            
                res.json(anosList)
        })
    })
})

basics.get("/:bloco", (request, response)=>{

    let { bloco } = request.params;

    var bl = data[bloco];
    response.json(bl)
})

basics.post("/", auth, (request, response) =>{
    let { bloco, nome, valor, mes, ano } = request.body;

    var uniqId = uniqid();
    var includeObj = {
        nome,
        valor,
        mes,
        ano,
        id: uniqId,
        tipo_despesa: tipoDespesa[bloco].nome,
        id_despesa: tipoDespesa[bloco].id,
        user_id:config.userId
    }

   // data[bloco].push(includeObj);

   pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let createItem = `INSERT INTO eco_data (nome, valor, mes, ano, id, tipo_despesa, id_despesa, user_id) VALUES ('${includeObj.nome}', '${includeObj.valor}', '${includeObj.mes}', '${includeObj.ano}', '${includeObj.id}', '${includeObj.tipo_despesa}', '${includeObj.id_despesa}', '${includeObj.user_id}')`;

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
    const { nome, valor, mes, ano } = request.body;
    const { id } = request.params;
    var responseObj = {};

    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let updateQuery = `UPDATE eco_data SET nome = '${nome}', valor = '${valor}', mes='${mes}' and ano=${ano} WHERE user_id = '${config.userId}' and id = '${id}'`;

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

    const { id } = request.params;
    var responseObj = {};
    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        let deleteitem = `DELETE FROM eco_data WHERE user_id = ${config.userId} and id = '${id}'`;

        connection.query(deleteitem, (error, result)=> {
            if (error) throw error;
            
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