const { app,dialog, BrowserWindow, Menu, ipcMain } = require("electron");
let os = require("os");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;

ipcMain.on("update-check", function(event, text) {
  console.log(text);
  //download("https://github.com/salilvnair/vdemy/releases/download/v0.0.3/Vdemy-0.0.3-win.zip","C:/Users/SalilNair/AppData/Local/vdemy-updater/pending/Vdemy-0.0.3-win.zip");
});

function sendStatusToWindow(text) {
  log.info(text);
  browserWindow.webContents.send(text);
}


function createWindow() {
  //log the user

  console.log(os.userInfo().username);
  console.log(process.platform);

  // Create the browser window.
  browserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + "/build/icon.icns",
    webPreferences: {
      webSecurity: false
    },
    autoHideMenuBar: true //added for auto hiding menu bar
  });
  //console.log(__dirname + '/build/index.html');
  // and load the index.html of the app.
  //browserWindow.loadURL(`file://${__dirname}/index.html`);

  browserWindow.loadURL('http://localhost:4200');
  browserWindow.webContents.openDevTools();
  // Emitted when the window is closed.
  browserWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    browserWindow = null;
  });

  // Create the Application's main menu
  var template = [
    {
      label: "Application",
      submenu: [
        {
          label: "About Application",
          click: function() {
            showVersion();
          }
        },
        {
          type: "separator"
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function() {
            app.quit();
          }
        },
        {
          label: "Restart",
          accelerator: "Command+R",
          click: function() {
            app.relaunch();
            app.exit(0);
          }
        },
        {
          label: "Developer Mode",
          accelerator: "Shift+CmdOrCtrl+I",
          click: function() {
            browserWindow.webContents.openDevTools();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          selector: "undo:"
        },
        {
          label: "Redo",
          accelerator: "Shift+CmdOrCtrl+Z",
          selector: "redo:"
        },
        {
          type: "separator"
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          selector: "cut:"
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          selector: "copy:"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          selector: "paste:"
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:"
        }
      ]
    }
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

function showVersion() {
  //alert();
  const options = {
    type: 'info',
    buttons: ['Ok'],
    title: 'About Vdemy',
    message: "Vdemy - "+app.getVersion(),
    detail: app.getVersion()
  };

  dialog.showMessageBox(null, options, (response) => {
    console.log(response);
  });
}

