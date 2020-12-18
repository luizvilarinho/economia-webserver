
const mysql = require("mysql");

const pool = mysql.createPool({
    host     : 'sql399.main-hosting.eu',
    user     : 'u575119774_vilarinho',
    password : 'Batata.33',
    database : 'u575119774_economia',
    connectionLimit: 10
  });

var data = {};
var user_id = 1;

pool.getConnection((err, connection) => {
    if(err) throw err;
    
    let queryDespesasFixas = `SELECT * FROM eco_data WHERE id_despesa = 1 and user_id = ${user_id}`;

    connection.query(queryDespesasFixas, (error, result)=> {
         if (error) throw error;
         
         data.despesasFixas = result;
         
        // console.log("DESPESAS FIXAS", data);
         //db.destroy();
        
    });

    let queryDespesasVariaveis = `SELECT * FROM eco_data WHERE id_despesa = 2 and user_id = ${user_id}`;

    connection.query(queryDespesasVariaveis, (error, result)=> {
        if (error) throw error;
        
        data.despesasVariaveis = result;
        
        //console.log("DESPESAS Variaveis", data);
        //db.destroy();
       
   });

   let queryEntradas = `SELECT * FROM eco_data WHERE id_despesa = 3 and user_id = ${user_id}`;

   connection.query(queryEntradas, (error, result)=> {
    if (error) throw error;
    
    data.entradas = result;
    
    //console.log("entradas", data);
    //db.destroy();
   
});



    connection.release();
})
/*var data = {
    despesasFixas:[
        {
            nome:"Aluguel",
            valor:"10",
            mes:"1",
            id:5
         },
         {
            nome:"Aluguel",
            valor:"1500",
            mes:"12",
            id:8789
         },
         {
            nome:"gasolina",
            valor:"15",
            mes:"1",
            id:parseInt(Math.random() * 1000)
         }
        
    ],
    despesasVariaveis:[
        {
            nome:"Mercado",
            valor:"590",
            mes:"1",
            id:parseInt(Math.random() * 1000)
         }
    ],
    entradas:[
        {
            nome:"Salário",
            valor:"5000",
            mes:"2",
            id:parseInt(Math.random() * 1000)
         }
    ],
      
    
}
*/
module.exports = data;