// Modules to control application life and create native browser window
const {
  app, 
  BrowserWindow, 
  Menu, 
  ipcMain
} = require('electron');

const fs = require('fs');

//database connection
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./kmans_db.sqlite3"
  },
  useNullAsDefault: true
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  //Insert menu
  Menu.setApplicationMenu(mainMenu);

  //maximize the mainWindow size
  mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('closed', function(){
    app.quit();
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  createWindow();  
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//========================= addwindow ======================================
//Create a addwindow
function createAddWindow(){
  addWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      width: 350,
      height: 430,
      title: 'Ajouter nouveau produit',
      resizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: true
      },
  });
  
  //Load html file into a window
  addWindow.loadFile('addwindow.html');

  addWindow.setMenu(null);

  //Garbage collection handle
  addWindow.on('close', function(){
      addWindow = null;
  });
}

//========================= productsWindow ======================================

function createProductsWindow(){
  productsWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      title: 'Gestion des produits',
      resizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: true
      },
  });

  productsWindow.maximize();

  //Load html file into a window
  productsWindow.loadFile('productsWindow.html');

  productsWindow.setMenu(null);

  //Garbage collection handle
  productsWindow.on('close', function(){
    productsWindow = null;
  });
}

//bind products
function listAllProducts(windowName){
  let products = knex.select('prod_id', 'prod_name', 'prod_pa', 'prod_pv', 'prod_stock').from('products').orderBy('prod_name');
  products.then(function(rows){
    windowName.webContents.send('products:bind', rows);
  })
}

ipcMain.on('mainWindowLoaded', function(){
  listAllProducts(mainWindow)
})

ipcMain.on('productsWindowLoaded', function(){
  listAllProducts(productsWindow)
  
})

//select product by id
ipcMain.on('product:bindById', function(e, args){
  let product = knex('products').where('prod_id', args).select('prod_id', 'prod_name', 'prod_pa', 'prod_pv', 'prod_stock');
  product.then(function(rows){
    mainWindow.webContents.send('product:bindById', rows);
  })
})

//Catch product:add
ipcMain.on('product:add', function(e, item){
  let req = knex('products').insert({prod_name: item[0], prod_pa: item[1], prod_pv: item[2], prod_stock: item[3]}).returning('prod_id');
  req.then(function(status){
    mainWindow.webContents.send('product:add', status);
    addWindow.close();
  })
})

//executer une vente
ipcMain.on('sale:add', function(e, items){
  /*let req_new_sale = knex('sales').insert({sale_at: Date.now(), sale_user_id: 0}).returning('sale_id');
  req_new_sale.then(function(status){*/
    let content = "";
    for(let i=0; i<items.length; i++){
     /* items[i]['sd_sale_id'] = status[0]
      knex('products').where('prod_id', '=', items[i]['sd_prod_id']).decrement({prod_stock: items[i]['sd_quantity']}).
      then((status)=>{
        console.log(status)
      })*/

      content += items[i]['sd_quantity']+"x épingles à mèches\t"+items[i]['sd_price']+"\t"+items[i]['sd_quantity']*items[i]['sd_price']+"\n";

    }

   /* fs.writeFile('ticket.txt', content, (err) => {  
      // throws an error, you could also catch it here
      if (err) throw err;
  
      // success case, the file was saved
      console.log('Lyric saved!');
  });

    let req_save_basket = knex('sale_details').insert(items);
    req_save_basket.then(function(status){
      mainWindow.loadFile('index.html');
    })
  })*/

})

//fermeture de addwindow
ipcMain.on('addWindow:close', (e, item)=>{
  addWindow.close()
})

//Create menu template
const mainMenuTemplate = [
  {label:''},
  {
    label: 'Options',
    submenu:[
        {
            label: 'Ajouter nouveau produit',
            click(){
                createAddWindow()
            }
        },
        {
            label: 'Afficher mon journal',
            click(){
              mainWindow.webContents.send('item:clearAll')
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
    ]
  }
];

//add admin menu if logged in
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
      label: 'Developer tools',
      submenu:[
          {
              label: 'Toggle DevTools',
              accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
              click(item, focusedWindow){
                  focusedWindow.toggleDevTools();
              }
          },
          {
              role: 'reload'
          }
      ]
    },

    //admin menu
    {
      label: 'Administration',
      submenu:[
        {
          label: 'Gestion des produits',
          click(){
            createProductsWindow()
          }
        },
        {
          label: 'Gestion des ventes'
        },
        {
          label: 'Gestion des charges'
        },
        {
          label: 'Gestion des utilisateurs'
        },
      ]
    }
  )
}


