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
  saveProduct: (data) => ipcRenderer.invoke('saveProduct', data ),
  updateProduct: (data) => ipcRenderer.invoke('saveProduct', data ),
  saveTransaction: (data) => ipcRenderer.invoke('saveTransaction', data ),
  fetchProducts: () => ipcRenderer.invoke('fetchProducts'),
  fetchTransactions: () => ipcRenderer.invoke('fetchTransactions'),
  getProductByID: (product_id) => ipcRenderer.invoke('getProductByID', product_id),
  getProductsByName: (name) => ipcRenderer.invoke('getProductsByName', name),
  updateProduct: (id, fieldToChange, oldValue, newValue, saveToLogs) => ipcRenderer.invoke('updateProduct', id, fieldToChange, oldValue, newValue, saveToLogs),
})
