
  (async () => {
    const response = await tools.fetchProducts();
    buildTable(response); 
  })();







  function buildTable(products) {
    const tableBody = document.querySelector('#productsTable tbody');
    products.forEach((product, index) => {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      
      if (index % 2 === 0) {
        row.style.backgroundColor = '#f2f2f2'; 
      } else {
        row.style.backgroundColor = '#ffffff'; 
      }
  
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price} FCFA</td>
        <td>${product.stocks}</td>
      `;


      //Bouton modifier
      const editBtn = document.createElement('i');
      editBtn.classList.add('fa-solid');
      editBtn.classList.add('fa-pen-to-square');
      editBtn.classList.add('text-2xl');
      editBtn.classList.add('text-green-600');
      editBtn.classList.add('hover:text-green-200');
      editBtn.classList.add('mx-2');
      let tmp = document.createElement('span');
      tmp.appendChild(editBtn);
      tmp.addEventListener('click', () => openEditModal(product));
      cell.appendChild(tmp)


      //Bouton vendre
      const sellBtn = document.createElement('i');
      sellBtn.classList.add('fa-solid');
      sellBtn.classList.add('fa-cart-shopping');
      sellBtn.classList.add('text-2xl');
      sellBtn.classList.add('text-green-600');
      sellBtn.classList.add('hover:text-green-200');
      sellBtn.classList.add('mx-2');
      tmp = document.createElement('span');
      tmp.appendChild(sellBtn);
      tmp.addEventListener('click', () => openModal(product, "vente"));
      cell.appendChild(tmp)
      

      //Bouton réapprovisionner
      const reStockBtn = document.createElement('i');
      reStockBtn.classList.add('fa-solid');
      reStockBtn.classList.add('fa-download');
      reStockBtn.classList.add('text-2xl');
      reStockBtn.classList.add('text-green-600');
      reStockBtn.classList.add('hover:text-green-200');
      reStockBtn.classList.add('mx-2');
      tmp = document.createElement('span');
      tmp.appendChild(reStockBtn);
      tmp.addEventListener('click', () => openModal(product, "restockage"));
      cell.appendChild(tmp)

      row.appendChild(cell)


      tableBody.appendChild(row);
    });
  }

  function openModal(product, type) {
    const modal = document.getElementById('saleModal');
    const modalPrice = document.getElementById('modalPrice');
    const modalTitle = document.getElementById('modalTitle');
    const modalQty = document.getElementById('modalQty');
    const modalComments = document.getElementById('modalComments');

    // Pre-fill modal fields
    modalPrice.value = product.price;
    modalQty.value = '';
    modalComments.value = '';
    modalTitle.textContent = (type==="vente") ? "Noter une Vente" : "Noter un restockage";

    // Show the modal
    modal.classList.remove('hidden');

    // Handle form submission
    const form = document.getElementById('saleForm');
    form.onsubmit = (e) => {
      e.preventDefault();

      const id = product.id;
      const name = product.name;
      const price = parseFloat(modalPrice.value);
      const qty = parseInt(modalQty.value, 10);
      const comments = modalComments.value;

      // Call your custom function
      if (type==="vente") {
        handleSale(id, price, qty, comments, name);
      } else {
        handleRestocking(id, price, qty, comments, name);
      }
      

      // Close the modal
      closeModal();
    };

    // Handle modal close
    document.getElementById('closeModal').onclick = closeModal;
  }









  function openEditModal(product) {
    const modal = document.getElementById('editModal');
    const modalName = document.getElementById('editModalName');
    const modalPrice = document.getElementById('editModalPrice');

    // Pre-fill modal fields
    modalName.value = product.name;
    modalPrice.value = product.price;
    editModalTitle.textContent = "Modifier le produit"

    // Show the modal
    modal.classList.remove('hidden');

    // Handle form submission
    const form = document.getElementById('editForm');
    form.onsubmit = (e) => {
      e.preventDefault();

      const id = product.id;
      const oldName = product.name;
      const oldPrice = parseFloat(product.price);
      const newPrice = parseFloat(modalPrice.value);
      const newName = modalName.value;

      if (oldName!=newName) {
        tools.updateProduct(id, 'name', oldName, newName, true).then(
          ()=>{
            toastr.success('Produit modifié !', '', { timeOut: 3000 });
            emptyList(); // Je vide la liste des produits pour l'actualiser
            (async () => {
              const response = await tools.fetchProducts();
              buildTable(response); //J'actualise la liste des produits
            })();
          }
        )
      }
      if (oldPrice!=newPrice) {
        tools.updateProduct(id, 'price', oldPrice, newPrice, true).then(
          ()=>{
            toastr.success('Produit modifié !', '', { timeOut: 3000 });
            emptyList(); // Je vide la liste des produits pour l'actualiser
            (async () => {
              const response = await tools.fetchProducts();
              buildTable(response); //J'actualise la liste des produits
            })();
          }
        )
      }
      


      // Close the modal
      closeEditModal();
    };

    // Handle modal close
    document.getElementById('closeEditModal').onclick = closeEditModal;
  }

  function closeModal() {
    const modal = document.getElementById('saleModal');
    modal.classList.add('hidden');
  }

  function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
  }

  function handleSale(id, price, qty, comments, name, ) {
    console.log('Sale details:', { id, price, qty, comments });

    (async () => {
      const product = await tools.getProductByID(id);
      console.log('Produit à vendre : '+ product.name); 
      if (product.stocks < qty) {
        toastr.error('Erreur : Stocks insuffisants sur ce produit!', '', { timeOut: 3000 });
      }
      else{
        const transaction = new Map();
  
        transaction.set('id', id);
        transaction.set('type', 0);
        transaction.set('name', name);
        transaction.set('price', price);
        transaction.set('quantity', qty);
        transaction.set('commentary', comments);
        transaction.set('stocks', product.stocks);
        
        tools.saveTransaction(transaction).then(
          ()=>{
            toastr.success('Vente enregistrée !', '', { timeOut: 3000 });
            const tableBody = document.querySelector('#productsTable tbody');
            tableBody.innerHTML = ''; // Je vide la liste des produits pour l'actualiser
            (async () => {
              const response = await tools.fetchProducts();
              buildTable(response); //J'actualise la liste des produits
            })();
          }
        )

        
      }
    })();
      
  }


  function emptyList() {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';
  }

  function handleRestocking(id, price, qty, comments, name, ) {
    console.log('Restocking details:', { id, price, qty, comments });

    (async () => {
      const product = await tools.getProductByID(id);
      console.log('Produit à recharger : '+ product.name); 
        const transaction = new Map();
  
        transaction.set('id', id);
        transaction.set('type', 1);
        transaction.set('name', name);
        transaction.set('price', price);
        transaction.set('quantity', qty);
        transaction.set('commentary', comments);
        transaction.set('stocks', product.stocks);
        
        tools.saveTransaction(transaction).then(
          ()=>{
            toastr.success('Vente enregistrée !', '', { timeOut: 3000 });
            const tableBody = document.querySelector('#productsTable tbody');
            emptyList(); // Je vide la liste des produits pour l'actualiser
            (async () => {
              const response = await tools.fetchProducts();
              buildTable(response); //J'actualise la liste des produits
            })();
          }
        )
    })();
      
  }




  let search = document.querySelector('#search');
  search.addEventListener('input', (e) =>{
    let value = search.value;
     console.log("a rechercher :"+ value);
    if (value!="") {
      (async () => {
        const response = await tools.getProductsByName(value.toLowerCase());
        emptyList();
        buildTable(response); 
      })();
    }
    else{
      (async () => {
        const response = await tools.fetchProducts();
        emptyList();
        buildTable(response); //J'actualise la liste des produits
      })();
    }
  } );