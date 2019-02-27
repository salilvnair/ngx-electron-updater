import { app, BrowserWindow } from "electron";
// import * as path from "path";
////uncomment below to hide security alert on console
//process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow:Electron.BrowserWindow;

function createWindow() {

  // Create the browser window.
  browserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + "/build/icon.icns",
    webPreferences: {
      webSecurity: false
    },
    autoHideMenuBar: false //auto hiding menu bar
  });

  // toggle between the index.html of the app or localhost:4200.
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
