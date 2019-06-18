const {electron, ipcRenderer} = require('electron');

let form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();
    let newProd = [];
    newProd = [$('#prod_name').val(), $('#prod_pa').val(), $('#prod_pv').val(), $('#prod_stock').val()];
    ipcRenderer.send('product:add', newProd);
}

$(document).on('click', '#closeAddWindowBtn', (e)=>{
    ipcRenderer.send('addWindow:close')
})