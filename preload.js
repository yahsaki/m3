const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getData: () => ipcRenderer.invoke('getData'),
  saveState: (state) => ipcRenderer.invoke('saveState', state),
  saveTags: (args) => ipcRenderer.invoke('saveTags', args),
})
