$(document).ready(()=>{

  const {ipcRenderer} = require('electron');

  //bind products from db
  ipcRenderer.send('mainWindowLoaded')
  ipcRenderer.on('products:bind', function(evt, result){

    for(let i=0; i<result.length; i++){
      $('#table_body').append(
      "<tr class='listprod'>"
          +"<td class='idP'>"+result[i].prod_id+"</td>"
          +"<td>"+result[i].prod_name+"</td>"
          +"<td>"+result[i].prod_pa+"</td>"
          +"<td>"+result[i].prod_pv+"</td>"
          +"<td>"+result[i].prod_stock+"</td>"
          +"<td>"
            +"<span  data_id='"+result[i].prod_id+"' title='modifier' class='close icon icon-pencil editProdBtn' style='color:#5bc0de'></span> &nbsp;&nbsp;&nbsp;"
            +"<span title='supprimer' class='deleteProdBtn close icon icon-cancel-circled ' style='color:red'></span>"
          +"</td>"
      +"</tr>"
      )
    }

  });

  //search products
  $(document).on('input', '#prod_search', (e)=>{
    $('.listprod').hide();
    $('.listprod:contains('+$(e.target).val()+')').show();
  })

  //add new product
  $('#addProdBtn').on('click', ()=>{
   ipcRenderer.send('product:addProd')
  })
  
  ipcRenderer.on('product:add', function(e, result){
    $('.ul').children().remove();
    ipcRenderer.send('mainWindowLoaded')
  })

  //edit product
  $(document).on('click', '.editProdBtn', (e)=>{
    let prodId = e.target.parentNode.parentNode.childNodes[0].textContent
    ipcRenderer.send('product:editProd', prodId)
  })

  //delete product
  $(document).on('click', '.deleteProdBtn', (e)=>{
    let prodId = e.target.parentNode.parentNode.childNodes[0].textContent
    ipcRenderer.send('product:deleteProd', prodId)
  })
 
})






