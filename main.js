const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const sq1ite3 = require('sqlite3')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('web/index.html')
  win.webContents.openDevTools()
}

function saveToDb(data) {
  const dbname = 'db/stock.db'
  let db = new sq1ite3.Database(dbname, err =>{
    if (err)
        throw err
    console.log( 'Database stated on ' + dbname)
    db.run( 'INSERT INTO products(name, price, stocks) VALUES(?, ?, ?)' ,[ data.get('name'), data.get('price'), data.get('amount') ] )
    console.log( data.get('amount') + ' '+  data.get('name') + ' at the price of ' + data.get('price') + 'have been added')
})
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => {
    console.log('pong')
    //db.run( "CREATE TABLE products (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, price FLOAT NOT NULL, stocks INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" )
  })
  ipcMain.handle('save', (e, data) => {saveToDb(data)})
  createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
