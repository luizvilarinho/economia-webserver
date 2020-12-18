const express = require("express");
const data = require("../data/data");

function somarValores(obj){

    if(obj.despesasFixas.length > 0){
        var df =  obj.despesasFixas.map(el=> el.valor)
          .reduce((acc, val)=> parseFloat(acc) + parseFloat(val));
    }

    if(obj.despesasVariaveis.length > 0){
        var dv =  obj.despesasVariaveis.map((el)=> el.valor)
            .reduce((acc, val)=>parseFloat(acc) + parseFloat(val));

    }
    
    if(obj.entradas.length > 0){
        var e =  obj.entradas.map(el=> el.valor)
            .reduce((acc, val)=> parseFloat(acc) + parseFloat(val));
    }
    

    var somaConsolidada = {
        despesasFixas:df || 0,
        despesasVariaveis:dv || 0,
        entradas:e || 0
    }

    return somaConsolidada;
}

module.exports = somarValores;