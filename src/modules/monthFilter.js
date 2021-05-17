
async function monthFilter(mes){
    //console.log("MES", mes);
    var dataFiltered = {};
    console.log("data")
    dataFiltered.despesasFixas = await data.despesasFixas.filter(bl => parseFloat(bl.mes) === parseFloat(mes));
    dataFiltered.despesasVariaveis = await data.despesasVariaveis.filter(bl => parseFloat(bl.mes) === parseFloat(mes));
    dataFiltered.entradas = await data.entradas.filter(bl => parseFloat(bl.mes) === parseFloat(mes));

    return dataFiltered;
}


module.exports = monthFilter;