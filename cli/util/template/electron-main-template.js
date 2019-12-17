const { app, BrowserWindow, Menu} = require("electron");
let dev;
const args = process.argv.slice(1);
dev = args.some(val => val === '--dev');
//hiding security alert on console on dev environment
//comment to disable hiding
if(dev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;

function sendStatusToWindow(text) {
  browserWindow.webContents.send(text);
}

function aboutApp() {
  dialog.showMessageBox({
    type: 'none',
    icon: __dirname + "/build/assets/images/app-logo.png",
    message: 'App Name' ,
    detail: 'Author: Ngx Electron Updater \nversion:'+app.getVersion()+'',
  });
}

function createWindow() {

  // Create the browser window.
  browserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + "/build/icon.icns",
    webPreferences: {
      nodeIntegration: true, //setting this as true as in new electron version its false by default set it to true if you will need renderer process and the main process communication
      webSecurity: false // set this as false only if your application may have CORS origin issue
    },
    autoHideMenuBar: false //auto hiding menu bar
  });

  // toggle between the index.html of the app or localhost:4200.
  //browserWindow.loadURL(`file://${__dirname}/index.html`);
  if(dev){
    browserWindow.loadURL('http://localhost:4200');
  }
  else{
    browserWindow.loadURL(`file://${__dirname}/build/index.html`);
  }

  // Emitted when the window is closed.
  browserWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    browserWindow = null;
  });

  // Create the Application's main menu
  var template = [{
    label: "Application",
    submenu: [
        { label: "About Application", click: function() {
          aboutApp();
        } },
        { type: "separator" },
        { label: "Hide", accelerator: "CmdOrCtrl+H", click: function() {
          if(browserWindow.isMenuBarVisible()){
            browserWindow.setMenuBarVisibility(false);
          }
          else{
            browserWindow.setMenuBarVisibility(true);
          }
         }},
        { type: "separator" },
        { label: "Check for Updates", accelerator: "CmdOrCtrl+U", click: function() {
            sendStatusToWindow('checkForUpdate');
         }},
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click: function() { app.quit(); }},
        { type: "separator" },
        { label: "Developer Mode", accelerator: "CmdOrCtrl+D", click: function() { browserWindow.webContents.openDevTools(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "CmdOrCtrl+Y", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);


// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (browserWindow === null) {
    createWindow();
  }
});
