$(document).ready(function(){

    const {
      BrowserWindow,
      ipcRenderer
    } = require('electron');
    const notifier = require('electron-notifications');
    const { dialog } = require('electron').remote

        
    ipcRenderer.on('item:clearAll', function(){
      ul.innerHTML = '';
    })

    //add new product
    ipcRenderer.on('product:add', function(e, result){
      $('.ul').children().remove();
      ipcRenderer.send('mainWindowLoaded')
    })

    //bind products from db
    ipcRenderer.send('mainWindowLoaded')
    ipcRenderer.on('products:bind', function(evt, result){
      let stock_state_element = "";
      for(var i=0; i<result.length; i++){
        if(result[i].prod_stock === 0){
          stock_state_element = "red";
        }else if(result[i].prod_stock >= 5){
          stock_state_element = "green";
        }else{
          stock_state_element = "orange";
        }

        $('.ul').append("<a href='#' id='"+result[i].prod_id+"' class='nav-group-item liproduct'>"
              +"<span class='icon icon-record' style='color:"+stock_state_element+"'></span>"
        +" ("+result[i].prod_stock+") "+result[i].prod_name.toString()+"</a>");
        
        /*
        $('.ul').append("<a href='#' id='"+result[i].prod_id+"' class='list-group-item list-group-item-action py-0 liproduct'>"+
        result[i].prod_name.toString()+"<span class='"+stock_state_element+"'> ("+result[i].prod_stock+")</span></a>");
        */
      }
      //result = null;
    });


    
    //ajout d'un produit au panier
    
    ipcRenderer.on('product:bindById', function(evt, prod){
      
        $('tbody').append("<tr scope='row' class='basketrows'>"+
        "<th class='first_td'> <input value='1' style='text-align:right; height:20px; width:70px' type='number' class='quantity' min='1' max='"+prod[0].prod_stock+"'>"+
        "<input value='"+prod[0].prod_id+"' type='hidden' class='prod_id' /></th>"+
        "<td>"+prod[0].prod_name+"</td>"+
        "<td align='right' class='pu'>"+prod[0].prod_pv.toLocaleString('fr-FR')+"</td>"+
        "<td class='Ptotal' align='right'>"+prod[0].prod_pv.toLocaleString('fr-FR')+"</td>"+
        "<td><span title='supprimer' class='close icon icon-cancel-circled ' style='color:red'></span></td>"+
        "</tr>");
        $totaux = 0;
        $('.Ptotal').each(function(i){
          $totaux = $totaux + Number($('.Ptotal').eq(i).text().replace(/\s/g,''));
          $('#totaux').val($totaux.toLocaleString('fr-FR'));
        });
    
             
    });

    $(document).on('click', 'a.liproduct', function(e){
        ipcRenderer.send('product:bindById', $(this).attr('id'))
        //console.log($(this).attr('id'))
    })

    //automatisation des calculs
    $(document).on('input', '.quantity', function(e){
      //console.log($(this).closest('tr').children('.pu').text().replace(/\s/g,''));
      var totalparligne = (Number(e.target.value) * Number($(this).closest('tr').children('.pu').text().replace(/\s/g,'')));
      $(this).closest('tr').children('.Ptotal').text(totalparligne.toLocaleString('fr-FR'));
      $totaux = 0;
      $('.Ptotal').each(function(i){
        $totaux = $totaux + Number($('.Ptotal').eq(i).text().replace(/\s/g,''));
        $('#totaux').val($totaux.toLocaleString('fr-FR'));
      })
    })

    //supprimer du panier
    $totaux = Number($('#totaux').val().replace(/\s/g,''));
    $(document).on('click', '.close', function(e){
      $totaux = $totaux - Number($(this).closest('tr').children('.Ptotal').text().replace(/\s/g,''));
      $('#totaux').val($totaux.toLocaleString('fr-FR'));
      e.target.parentNode.parentNode.remove();
    })

    //Rechercher un produit
    $(document).on('input', '.search', function(e){
      $('.liproduct').hide();
      $('.liproduct:contains('+$(this).val()+')').show();
    })

    //Executer une vente
    let basketshop = [];
    $(document).on('click', '#btn_vendre', function(e){
      $('.basketrows').each(function(index){
        basketshop[index] = {'sd_prod_id' : $(this).children('.first_td').children('.prod_id').val(),
        'sd_quantity' : $(this).children('.first_td').children('.quantity').val(),
        'sd_price' : Number($(this).children('.pu').text().replace(/\s/g,''))
      };
      })
      ipcRenderer.send('sale:add', basketshop);
      /*if(!basketshop.length){
        dialog.showMessageBox(null, {
          parent: mainWindow,
          type: 'info',
          modal: true,
          message: 'Panier de produits vide ?',
          detail: 'Veuillez ajouter des produits au panier',
        })
      }else{
        dialog.showMessageBox(null, {
          parent: mainWindow,
          type: 'question',
          modal: true,
          message: 'Valider',
          detail: 'Si vous cliquez sur "Non" aucune action ne sera faite !',
          icon: './public/img/win/calendar.png',
          buttons: ['Oui', 'Non'],
          noLink: true
        }, (response)=>{
  
          if(response === 0){
            ipcRenderer.send('sale:add', basketshop);
          }  
        })
      }*/
      
    })

    //vider le panier
    $(document).on('click', '#btn_vider', (e)=>{
      $('tbody').children().remove();
      $('#totaux').val(0);
    })

    $(document).on('click', '#notify', function(){
   
      /*
      // Full Options
      notifier.notify('Calendar', {
        message: 'Event begins in 10 minutes',
        icon: './img/win/calendar.png',
        buttons: ['Dismiss', 'Snooze'],
        duration: 5000
      })
      */
    })

})