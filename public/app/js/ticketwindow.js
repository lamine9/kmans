
    window.$ = require('jquery')

    const {
            electron,
            ipcRenderer
            } = require('electron');
    
    // ipcRenderer.send('ticketwindowLoaded')
    ipcRenderer.send('ticketwindowLoaded')
    ipcRenderer.on('ticket:bind', (evt, result)=>{

        let dateofsale = new Date(result[0].sale_at)
        let d = dateofsale.getDate()
        let m = (dateofsale.getMonth()) + 1
        let y = dateofsale.getFullYear()
        let h = dateofsale.getHours()
        let mn = dateofsale.getMinutes()
        let s = dateofsale.getSeconds()

        $('#sale_at').html('Date : ' +d+'/'+m+'/'+y+' - '+h+':'+mn+':'+s )
        $('#sale_id').html('Facture Numéro: 00' + result[0].sale_id)
        $('#ticketbody').children().remove()
        for(let i=0; i < result.length; i++){
            $('#ticketbody').append('<tr>'
                +'<td>' + result[i].sd_quantity + '</td>'
                +'<td>' + result[i].prod_name + '</td>'
                +'<td style="text-align:right">' + result[i].sd_price + '</td>'
                +'<td class=\'pt\' style="text-align:right">' + (result[i].sd_price * result[i].sd_quantity).toLocaleString('fr-FR') + '</td>'
                +'</tr>')
        }
        var total = 0
        $('.pt').each(function(i){
            total = total + Number($(this).text().replace(/\s/g,''))
        })
        $('#total').html('<b>'+total.toLocaleString('fr-FR')+'</b>')

        result = null
    })


   