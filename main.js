const { BrowserWindow, Menu, app, ipcMain } = require('electron');
const os = require('os');
const path = require('path');
const shell = require('electron').shell


function createWindow() {
  let width;
  if (process.env.ENV == 'DEV') {
      width = 1300;
  }
  else {
      width = 1000;
  }

  const win = new BrowserWindow({
    title: "Templatr",
    width: width,
    height: 700,
    backgroundColor: "white",
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html');

  // Open the DevTools
  if (process.env.ENV == 'DEV') {
    win.webContents.openDevTools()
  }

  const menu = Menu.buildFromTemplate([
      {
        label: 'Application',
        submenu: [
          {
            label:'About',
            click() { 
              openAboutWindow();
            }
          },
          {type:'separator'},
          {
            label:'Edit Templates',
            click() { 
              const p = shell.openPath(path.join(os.homedir(), '.templatr', 'template.yaml'))
            }
          },
          {
            label:'Relaunch App',
            click() { 
              app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
              app.exit(0)
            }
          },
          {type:'separator'},
          { 
              label:'Exit', 
              click() { 
                  app.quit() 
              } 
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
  ]);
  Menu.setApplicationMenu(menu); 
}

var newWindow = null

function openAboutWindow() {
  if (newWindow) {
    newWindow.focus()
    return
  }

  newWindow = new BrowserWindow({
    height: 340,
    resizable: false,
    width: 360,
    title: 'About Templatr',
    minimizable: false,
    fullscreenable: false
  })

  newWindow.loadURL('file://' + __dirname + '/about.html')

  newWindow.on('closed', function() {
    newWindow = null
  })
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Receive and respond to synchronous message
// Set or remove notification badge
ipcMain.on('badge', (event, args) => {
  if (process.platform === 'darwin') {
    if (args != 0) {
      if (app.dock.getBadge()) {
        let badgeCount = parseInt(app.dock.getBadge()) + args;
        if (badgeCount > 0) {
          app.dock.setBadge((parseInt(app.dock.getBadge()) + args).toString());
        }
        else {
          app.dock.setBadge('');
        }
      }
      else {
        if (args > 0) {
          app.dock.setBadge(args.toString());
        }
        else {
          app.dock.setBadge('');
        }
      }
    }
    else {
      app.dock.setBadge('');
    }
    event.returnValue = true;
  }
  else {
    event.returnValue = false;
  }
 });
