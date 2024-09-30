const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('node:path')
const m3 = require('./m3')

let _data

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    //frame: false,
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('saveState', saveState)
  ipcMain.handle('getData', async () => {
    console.log('getting data', _data)
    return {
      playlist: _data.playlist,
      state: _data.state,
    }
  })
  ipcMain.handle('saveTags', saveTags)

  createWindow()
  _data = m3.init()
  console.log('data', _data)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

async function saveState(event, args) { await m3.state.save(args);return }
async function saveTags(event, args) { await m3.tags.save(args);return }

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
