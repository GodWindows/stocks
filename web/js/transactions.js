(async () => {
    const response = await tools.fetchTransactions();

    buildTable(response); 
  })();
  


  function buildTable(transactions) {
    const tableBody = document.querySelector('#transactionsTable tbody');
    transactions.forEach((transaction, index) => {
      const row = document.createElement('tr');
      
      if (index % 2 === 0) {
        row.style.backgroundColor = '#f2f2f2'; 
      } else {
        row.style.backgroundColor = '#ffffff'; 
      }
      let transaction_type = (transaction.transaction_type==0) ? "Vente" : "Restockage";
      let transaction_color = (transaction.transaction_type==0) ? "ffffff" : "blue";
      row.innerHTML = `
        <td>${transaction.id}</td>
        <td style = "color :'${transaction_color}'" >${transaction_type}</td>
        <td>${transaction.name}</td>
        <td>${transaction.transaction_price} FCFA</td>
        <td>${transaction.quantity}</td>
        <td>${(transaction.quantity * transaction.transaction_price)} FCFA</td>
        <td>${transaction.commentary}</td>
      `;
  
      tableBody.appendChild(row);
    });
  }
