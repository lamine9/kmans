// Modules to control application life and create native browser window
const {
  BrowserWindow,
  BrowserView,
  dialog,
  Menu,
  ipcMain,
} = require("electron");

const app = require("electron").app;
const path = require("path");

const fs = require("fs");

//database connection
var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join("./kmans_db.sqlite3"),
  },
  useNullAsDefault: true,
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  //Insert menu
  Menu.setApplicationMenu(mainMenu);

  //maximize the mainWindow size
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on("closed", function () {
    app.quit();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//========================= addwindow ======================================
//Create a addwindow
function createAddWindow() {
  addWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 350,
    height: 430,
    title: "Ajouter nouveau produit",
    resizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //Load html file into a window
  addWindow.loadFile("views/addwindow.html");

  addWindow.setMenu(null);

  //Garbage collection handle
  addWindow.on("close", function () {
    addWindow = null;
  });
}

//========================= editwindow ======================================
//Create a editwindow
var editWindow;
function createEditWindow() {
  editWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 350,
    height: 430,
    title: "Modifier le produit",
    resizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  editWindow.loadFile("views/editwindow.html");

  editWindow.setMenu(null);

  //Garbage collection handle
  editWindow.on("close", function () {
    editWindow = null;
  });
}

//========================= ticketwindow ======================================
//Create a TicketWindow
function createTicketWindow() {
  ticketwindow = new BrowserWindow({
    title: "Reçu de vente",
    parent: mainWindow,
    minimizable: true,
    resizable: false,
    modal: false,
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //Load html file into a window
  ticketwindow.loadFile("views/ticketwindow.html");

  ticketwindow.setMenu(null);

  //Garbage collection handle
  ticketwindow.on("close", function () {
    addWindow = null;
  });
}

//impression de ticket
ipcMain.on("ticketwindow:print", (e, item) => {
  let contents = ticketwindow.webContents;
  contents.print();
});

//bind products
function listAllProducts(windowName) {
  let products = knex
    .select("prod_id", "prod_name", "prod_pa", "prod_pv", "prod_stock")
    .from("products")
    .orderBy("prod_name");
  products.then(function (rows) {
    windowName.webContents.send("products:bind", rows);
  });
}

// Filter sales by dates
ipcMain.on("FilterSalesByDates", (e, dates) => {
  knex("sale_details")
    .join("sales", "sale_id", "sd_sale_id")
    .join("products", "prod_id", "sd_prod_id")
    .whereBetween("sale_at", [dates[0], dates[1] + 24 * 60 * 60 * 1000])
    .then(function (rows) {
      mainWindow.webContents.send("sales:bind", rows);
    });
});

//bind sales
function listAllSales(windowName) {
  knex("sale_details")
    .join("sales", "sale_id", "sd_sale_id")
    .join("products", "prod_id", "sd_prod_id")
    .where("sale_at", ">=", new Date().getTime() - 24 * 60 * 60 * 1000)
    .then(function (rows) {
      windowName.webContents.send("sales:bind", rows);
    });
}

ipcMain.on("mainWindowLoaded", function () {
  listAllProducts(mainWindow);
  listAllSales(mainWindow);
});

ipcMain.on("product:addProd", () => {
  createAddWindow();
});

ipcMain.on("product:editProd", (e, args) => {
  createEditWindow();
  ipcMain.on("product:openEditProd", (e, item) => {
    knex("products")
      .where("prod_id", args)
      .select("prod_id", "prod_name", "prod_pa", "prod_pv", "prod_stock")
      .then(function (rows) {
        editWindow.webContents.send("product:bindEditById", rows);
      });
  });
});

//product:edit
ipcMain.on("product:edit", function (e, item) {
  let req = knex("products").where({ prod_id: item[0] }).update({
    prod_name: item[1],
    prod_pa: item[2],
    prod_pv: item[3],
    prod_stock: item[4],
  });
  req.then(function (status) {
    editWindow.close();
    mainWindow.loadFile("./views/productsWindow.html");
  });
});

//product:delete
ipcMain.on("product:deleteProd", (e, arg) => {
  dialog.showMessageBox(
    mainWindow,
    {
      type: "question",
      message:
        "Etes - vous sur(e)s de vouloir supprimer ce produit? : oui / non ?",
      detail: 'Si vous cliquez sur "Non" aucune action ne sera faite !',
      buttons: ["Oui", "Non"],
      noLink: true,
    },
    (response) => {
      if (response === 0) {
        knex("products")
          .where("prod_id", arg)
          .del()
          .then((status) => {
            mainWindow.loadFile("./views/productsWindow.html");
          });
      }
    }
  );
});

/*
ipcMain.on('productsWindowLoaded', function(){
  listAllProducts(productsWindow)
  
})
*/

//select product by id
ipcMain.on("product:bindById", function (e, args) {
  let product = knex("products")
    .where("prod_id", args)
    .select("prod_id", "prod_name", "prod_pa", "prod_pv", "prod_stock");
  product.then(function (rows) {
    if (rows[0].prod_stock > 0) {
      mainWindow.webContents.send("product:bindById", rows);
    } else {
      dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "Rupture de stock !",
        message: "Veuillez augmenter le stock de ce produit",
      });
    }
  });
});

//product:add
ipcMain.on("product:add", function (e, item) {
  let req = knex("products")
    .insert({
      prod_name: item[0],
      prod_pa: item[1],
      prod_pv: item[2],
      prod_stock: item[3],
    })
    .returning("prod_id");
  req.then(function (status) {
    addWindow.close();
    mainWindow.loadFile("./views/productsWindow.html");
  });
});

//executer une vente
ipcMain.on("sale:add", function (e, items) {
  if (items.length === 0) {
    dialog.showMessageBox(mainWindow, {
      parent: mainWindow,
      type: "warning",
      title: "Panier de produits vide ?",
      message: "Veuillez ajouter des produits au panier",
    });
  } else {
    dialog.showMessageBox(
      mainWindow,
      {
        type: "question",
        message: "Confirmer? : oui / non ?",
        detail: 'Si vous cliquez sur "Non" aucune action ne sera faite !',
        buttons: ["Oui", "Non"],
        noLink: true,
      },
      (response) => {
        if (response === 0) {
          var last_sale_id = 0;
          let req_new_sale = knex("sales")
            .insert({ sale_at: Date.now(), sale_user_id: 0 })
            .returning("sale_id");
          req_new_sale.then(function (status) {
            for (let i = 0; i < items.length; i++) {
              items[i]["sd_sale_id"] = status[0];
              knex("products")
                .where("prod_id", "=", items[i]["sd_prod_id"])
                .decrement({ prod_stock: items[i]["sd_quantity"] })
                .then((status) => {
                  //console.log(status)
                });

              last_sale_id = status[0];
            }

            let req_save_basket = knex("sale_details").insert(items);
            req_save_basket.then(function (status) {
              mainWindow.loadFile("index.html");
              createTicketWindow();
            });

            ipcMain.on("ticketwindowLoaded", (e, items) => {
              knex
                .select("*")
                .from("products")
                .join("sale_details", {
                  "products.prod_id": "sale_details.sd_prod_id",
                })
                .join("sales", { "sales.sale_id": "sale_details.sd_sale_id" })
                .where("sales.sale_id", "=", last_sale_id)
                .then((res) => {
                  ticketwindow.webContents.send("ticket:bind", res);
                });
            });
          });
        }
      }
    );
  }
});

//close addwindow
ipcMain.on("addWindow:close", (e, item) => {
  addWindow.close();
});

//close editwindow
ipcMain.on("editWindow:close", (e, item) => {
  editWindow.close();
});

//Create menu template
const mainMenuTemplate = [
  { label: "" },
  {
    label: "Developer tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
      },
    ],
  },
  {
    label: "Options",
    submenu: [
      {
        label: "Nouveau produit",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Journal",
        click() {
          mainWindow.webContents.send("item:clearAll");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

//add admin menu if logged in
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push(
    //caissier menu
    {
      label: "Caisses",
      submenu: [
        {
          label: "Caisse #1",
          click() {
            mainWindow.loadFile("index.html");
          },
        },
      ],
    },

    //admin menu
    {
      label: "Administration",
      submenu: [
        {
          label: "Gestion des produits",
          click() {
            //createProductsWindow()
            mainWindow.loadFile("./views/productsWindow.html");
          },
        },
        {
          label: "Gestion des ventes",
          click() {
            //createProductsWindow()
            mainWindow.loadFile("./views/ventesWindow.html");
          },
        },
        {
          label: "Gestion des charges",
          click() {
            //createProductsWindow()
            mainWindow.loadFile("./views/chargesWindow.html");
          },
        },
        {
          label: "Gestion des utilisateurs",
          click() {
            //createProductsWindow()
            mainWindow.loadFile("./views/usersWindow.html");
          },
        },
      ],
    }
  );
}
