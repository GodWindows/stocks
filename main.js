const { app, BrowserWindow, ipcMain } = require('electron/main')
const { log } = require('node:console')
const path = require('node:path')
const sqlite3 = require('sqlite3')
const ftp = require("basic-ftp");
require("dotenv").config();


async function uploadFile() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
      await client.access({
          host: process.env.FTP_HOST,
          user: process.env.FTP_USER,
          password: process.env.FTP_PASS,
          secure: false
      });

      await client.uploadFrom("db/stock.db", "stock.db");
      console.log("Database uploaded and overwritten successfully!");
  } catch (err) {
      console.error("FTP upload failed:", err.message);
  } finally {
      client.close();
  }
}


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('web/index.html')
  //win.webContents.openDevTools()
}

function saveProduct(data) {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
      throw err;
    }
    console.log('Database connected:', dbname);
  });

  db.serialize(() => {
    db.run(
      'INSERT INTO products (name, price, stocks) VALUES (?, ?, ?)',
      [data.get('name'), data.get('price'), data.get('amount')],
      function (err) {
        if (err) {
          console.error('Failed to insert product:', err.message);
          return;
        }
  
        const product_id = this.lastID; // Get the ID of the last inserted row
        console.log('Product added with ID:', product_id);
  
        // Insert into the transactions table after the product is added
        db.run(
          'INSERT INTO transactions (product_id, transaction_type, transaction_price, quantity, commentary) VALUES (?, ?, ?, ?, ?)',
          [product_id, 1, data.get('price'), data.get('amount'), 'CREATION DU PRODUIT'],
          (err) => {
            if (err) {
              console.error('Failed to insert transaction:', err.message);
            } else {
              console.log(
                `${data.get('amount')} ${data.get('name')} at the price of ${data.get('price')} has been added, with a corresponding transaction.`
              );
            }
  
            // Close the database connection after the transaction is inserted
            db.close((err) => {
              if (err) {
                console.error('Error closing the database:', err.message);
              } else {
                console.log('Database connection closed.');
              }
            });
          }
        );
      }
    );
  });
  
}

function updateProduct(id, fieldToChange, oldValue, newValue, saveToLogs = true) {
  console.log('gonna update');
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
      throw err;
    }
    console.log('Database connected to update:', dbname);
  });

  db.serialize(() => {
    db.run(
      `UPDATE products SET ${fieldToChange} = ? WHERE id = ?`,
      [newValue, id],
      function (err) {
        if (err) {
          console.error('Failed to update product:', err.message);
          return;
        } 
        console.log('---- Update finished');

        if (saveToLogs) {
          const logMessage = `PRODUIT ${id} MODIFIÉ SUR LA VALEUR ${fieldToChange}. ANCIENNE VALEUR: ${oldValue}, NOUVELLE VALEUR: ${newValue}`;

          db.run(
            'INSERT INTO logs (commentary) VALUES (?)',
            [logMessage],
            (err) => {
              if (err) {
                console.error('Failed to insert log:', err.message);
              } else {
                console.log('Log saved.');
              }

              db.close((err) => {
                if (err) {
                  console.error('Error closing the database:', err.message);
                } else {
                  console.log('Database connection closed.');
                }
              });
            }
          );
        } else {
          db.close((err) => {
            if (err) {
              console.error('Error closing the database:', err.message);
            } else {
              console.log('Database connection closed.');
            }
          });
        }
      }
    );
  });
}







async function getProductByID(product_id) {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) throw err;
    console.log('Database started to fetch the product of id = '+product_id+' on ' + dbname);
  });

  
  const result = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM products WHERE id = ?',[product_id] ,(err, data) => {
      if (err) {
        reject(err); 
      } else {
        console.log(data)
        resolve(data); 
      }
    });
  });

  db.close();
  return result[0];
}






async function getProductsByName(name) {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) throw err;
    console.log('Database started to search the word \''+name+'\' in the products' + dbname);
  });

  
  const result = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM products WHERE LOWER(name) LIKE ?",['%'+name+'%'] ,(err, data) => {
      if (err) {
        reject(err); 
      } else {        
        resolve(data); 
      }
    });
  });

  db.close();
  return result;
}



function saveTransaction(data) {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
      throw err;
    }
    console.log('Database connected:', dbname);
  });


  db.run(
    'INSERT INTO transactions (product_id, transaction_type, transaction_price, quantity, commentary) VALUES (?, ?, ?, ?, ?)',
    [data.get('id'),  data.get('type') , data.get('price'), data.get('quantity'), data.get('commentary')],
    (err) => {
      if (err) {
        console.error('Failed to insert transaction:', err.message);
      } else {
        console.log(
          ` Transaction of type ${data.get('type')} on ${data.get('name')} at the price of ${data.get('price')} has been created.`
        );
      }

      // Close the database connection after the transaction is inserted
      db.close((err) => {
        if (err) {
          console.error('Error closing the database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  );


  (async () => {
    if (data.get('type') == 0) { // Si la transaction est une vente, mettre à jour le solde
      updateProduct(data.get('id'), 'stocks', data.get('stocks'), (data.get('stocks') - data.get('quantity')), false);
    } else { // Si la transaction est un restockage, mettre à jour le solde
        updateProduct(data.get('id'), 'stocks', data.get('stocks'), (data.get('stocks') + data.get('quantity')), false);
    }
  })();

  


}

async function fetchProducts() {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) throw err;
    console.log('Database started on ' + dbname);
  });

  
  const result = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', (err, data) => {
      if (err) {
        reject(err); 
      } else {
        resolve(data); 
      }
    });
  });

  db.close();
  return result;
}



async function fetchTransactions() {
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) throw err;
    console.log('Database started on ' + dbname);
  });

  
  const result = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM transactions, products WHERE transactions.product_id = products.id', (err, data) => {
      if (err) {
        reject(err); 
      } else {
        resolve(data); 
      }
    });
  });

  db.close();
  return result;
}


app.whenReady().then(() => {
  uploadFile().catch(() => console.log("Skipping upload due to network issues.")); //Update the db on the webserver on the app launch
  const dbname = 'db/stock.db';
  const db = new sqlite3.Database(dbname, (err) => {
    if (err) throw err;
    console.log('Database started on ' + dbname);
    db.run( "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, price FLOAT NOT NULL, stocks INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" )
    db.run( "CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY,  product_id INT NOT NULL, transaction_type INT NOT NULL, transaction_price FLOAT NOT NULL, quantity INT NOT NULL, commentary TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" )
    db.run( "CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, commentary TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" )
  });
  ipcMain.handle('ping', () => {
    console.log('pong')
  })
  ipcMain.handle('saveProduct', (e, data) => { saveProduct(data) })
  ipcMain.handle('saveTransaction', (e, data) => { saveTransaction(data) })
  ipcMain.handle('fetchProducts', async (e) => { 
    const products = await fetchProducts();
    return products; 
  })
  ipcMain.handle('fetchTransactions', async (e) => { 
    const transactions = await fetchTransactions();
    return transactions; 
  })
  ipcMain.handle('getProductByID', async (e, product_id) => { 
    const product = await getProductByID(product_id);
    return product; 
  })
  ipcMain.handle('getProductsByName', async (e, name) => { 
    const product = await getProductsByName(name);
    return product; 
  })
  ipcMain.handle('updateProduct', async (e, id, fieldToChange, oldValue, newValue, saveToLogs) => updateProduct(id, fieldToChange, oldValue, newValue, saveToLogs))
  
  createWindow()
})

app.on('window-all-closed', () => {
  uploadFile().catch(() => console.log("Skipping upload due to network issues.")); //Update the db on the webserver on the app closing. but is not working...why?
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
