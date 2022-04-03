const express = require("express");
const basics = express.Router();

const config = require('../config');
const auth = require('../modules/auth');
var uniqid = require('uniqid');

const mysql = require("mysql");
// const util = require('util');

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
    
    if(mes && ano){
       var queryMes = `and mes = ${mes} and ano = ${ano}`
    }else{
        let dataAtual = new Date();
        let mesAtual = dataAtual.getMonth();
        let anoATual = dataAtual.getFullYear();
        var queryMes = `and mes = ${mesAtual} and ano = ${anoATual}`
    }

    data = {};
    pool.getConnection(async (err, connection) => {
        if(err) throw err;
        
        // let queryDespesas = `SELECT * FROM eco_data WHERE user_id = ${config.userId} ${queryMes}`;
        // console.log("exec-query", queryDespesas);

        let queryDespesas = 
        `SELECT * FROM eco_data 
            WHERE user_id=${config.userId} AND
            (id_despesa=1 ${queryMes}) OR
            (id_despesa=2 ${queryMes}) OR
            (id_despesa=3 ${queryMes})`
            
           try{
            connection.query(queryDespesas, async (error, result)=> {
                
                if(error) console.log(error);


                let formatter={
                    ano: ano || anoATual,
                    mes: mes || mesAtual,
                    despesasFixas:[],
                    despesasVariaveis: [],
                    entradas:[]
                };

                result.map(despesa=>{
                    let obj = {
                        nome: despesa.nome,
                        valor: despesa.valor,
                        tipo_despesa:despesa.tipo_despesa,
                        id:despesa.id
                    }
                    if(despesa.id_despesa === 1){
                        formatter.despesasFixas.push(obj);
                    }
                    if(despesa.id_despesa === 2){
                        formatter.despesasVariaveis.push(obj);
                    }
                    if(despesa.id_despesa === 3){
                        formatter.entradas.push(obj);
                    }
                })

                //verifica despesasFixas
                if(formatter.despesasFixas.length === 0){
                   
                    let queryDespesasFixasDoAno = ` SELECT * FROM  eco_data WHERE user_id=${config.userId} AND id_despesa=1 AND ano = ${ano || anoAtual}`;

                    connection.query(queryDespesasFixasDoAno, (error, result)=>{
                        let mesPesquisado = mes || mesAtual;

                        
                        if(mesPesquisado > 1){
                            
                            for(let i = mesPesquisado -1; i > 0; i--){
                                let filtro = result.filter(despesa=>{return despesa.mes === i && despesa.id_despesa === 1})
                                if(filtro.length > 0){

                                    //gravar no banco 
                                    filtro.map(desp=>{
                                        console.log("desp", desp)
                                        var uniqId = uniqid();
                                        let insertQuery = `INSERT INTO eco_data 
                                            (ano, id, id_despesa, mes, nome, tipo_despesa, user_id, valor) VALUES
                                            (${ano || anoAtual}, '${uniqId}', 1, ${mes || mesAtual},'${desp.nome}', 'despesa_fixa', ${config.userId}, ${desp.valor})`;

                                            console.log("insertQuery",insertQuery)
                                            connection.query(insertQuery, (error, result)=>{
                                                if(error) console.log(error)

                                                console.log("INSERT", result)
                                            })
                                        
                                    })
                                    
                                    connection.query(queryDespesas, (error, result)=>{
                                        if(error) console.log(error)

                                        let formatter={
                                            ano: ano || anoATual,
                                            mes: mes || mesAtual,
                                            despesasFixas:[],
                                            despesasVariaveis: [],
                                            entradas:[]
                                        };
                        
                                        result.map(despesa=>{
                                            let obj = {
                                                nome: despesa.nome,
                                                valor: despesa.valor,
                                                tipo_despesa:despesa.tipo_despesa,
                                                id:despesa.id
                                            }
                                            if(despesa.id_despesa === 1){
                                                formatter.despesasFixas.push(obj);
                                            }
                                            if(despesa.id_despesa === 2){
                                                formatter.despesasVariaveis.push(obj);
                                            }
                                            if(despesa.id_despesa === 3){
                                                formatter.entradas.push(obj);
                                            }
                                        })
                                        
                                        console.log("FORMMATTTER", formatter)
                                        response.json(formatter);

                                    })
                                    return
                                }

                                if(mesPesquisado === 1){
                                    response.json([])
                                    return
                                }
                                
                            }

                           
                        }

                    })
                }else{
                    response.json(formatter) ;
                }


               
            })
           }catch(error){
               console.log(error)
           }


        
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