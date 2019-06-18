$(document).ready(()=>{
    const {ipcRenderer} = require('electron');
    //bind products from db
    ipcRenderer.send('productsWindowLoaded');
    ipcRenderer.on('products:bind', function(evt, result){
      let stock_state_element = "";
      for(var i=0; i<result.length; i++){
        if(result[i].prod_stock == 0){
          stock_state_element = "text-danger";
        }else{
          stock_state_element = "";
        }
        /*
        $('tbody').append("<tr class='"+stock_state_element+"'>"+
        "<td>"+result[i].prod_stock+"</td>"+
        "<td>"+result[i].prod_name+"</td>"+
        "<td>"+result[i].prod_pa+"</td>"+
        "<td>"+result[i].prod_pv+"</td>"+
        "<td></td>"+
        "</tr>")
        */
       $('.ul').append("<a href='#' id='"+result[i].prod_id+"' class='list-group-item list-group-item-action py-0 liproduct'>"+
        result[i].prod_name.toString()+"<span class='"+stock_state_element+"'> ("+result[i].prod_stock+")</span></a>");
      }
      result = null;
    });

})