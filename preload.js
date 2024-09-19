const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  my_name: "Damso",
  ping: () => ipcRenderer.invoke('ping')

  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('tools', {
  save: (data) => ipcRenderer.invoke('save', data )
})