$(document).ready(()=>{

    const {ipcRenderer} = require('electron');
    ipcRenderer.send('product:openEditProd')
    ipcRenderer.on('product:bindEditById', function(e, result){
        $("#prod_id").val(result[0].prod_id)
        $("#prod_name").val(result[0].prod_name)
        $("#prod_pa").val(result[0].prod_pa)
        $("#prod_pv").val(result[0].prod_pv)
        $("#prod_stock").val(result[0].prod_stock)
    })

    let form = document.querySelector('form');
    form.addEventListener('submit', submitForm);

    function submitForm(e){
        e.preventDefault();
        let newProd = [];
        editProd = [$('#prod_id').val(), $('#prod_name').val(), $('#prod_pa').val(), $('#prod_pv').val(), $('#prod_stock').val()];
        ipcRenderer.send('product:edit', editProd);
    }

    $(document).on('click', '#closeEditWindowBtn', (e)=>{
        ipcRenderer.send('editWindow:close')
    })

})