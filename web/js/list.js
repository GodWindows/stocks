
  function toggleForm(index, formClass) {
    const forms = document.querySelectorAll(`.${formClass}`);
    const form = forms[index];

    // Toggle visibility with height change
    if (form.classList.contains('hidden')) {
      form.classList.remove('hidden');
      form.classList.add('active');
    } else {
      form.classList.add('hidden');
      form.classList.remove('active');
    }
  }



const getFromDb = async (keyword) => {
  const response = await tools.getFromDb(keyword);
}

function initializeList () {
  getFromDb("").then( (products)=>{
    products.forEach(product => {
      addToTheHTMLlist(product)
    });
  } )
  
}

function addToTheHTMLlist(product) {
let productName = product.name;
let productPrice = product.price;
let productStocks = product.stocks;
let uniqueId = product.id; // Unique identifier for the buttons

// Create the product div dynamically
let productDiv = document.createElement('div');
productDiv.classList.add('product-row', 'border-b', 'border-gray-300', 'py-4');

// Set the inner HTML of the product div
productDiv.innerHTML = `
  <div class="flex justify-between items-center">
    <div class="text-lg font-semibold">${productName}</div>
    <div>Stocks: <span class="text-gray-700">${productStocks}</span></div>
    <div>Prix: <span class="text-gray-700">${productPrice}€</span></div>
    <div class="flex gap-4">
      <button id="edit-${uniqueId}" class="edit-btn text-blue-500">✏️</button>
      <button id="buy-${uniqueId}" class="buy-btn text-green-500">➕</button>
      <button id="sell-${uniqueId}" class="sell-btn text-red-500">💰</button>
    </div>
  </div>
  
  <!-- Edit Form (Hidden by default) -->
  <div class="edit-form roll-down hidden mt-4">
    <div class="form-container">
      <input type="text" placeholder="Nom" class="p-2 border border-gray-300 rounded-md">
      <input type="number" placeholder="Prix" class="p-2 border border-gray-300 rounded-md">
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md">Modifier</button>
    </div>
  </div>

  <!-- Buy Form (Hidden by default) -->
  <div class="buy-form roll-down hidden mt-4">
    <div class="form-container">
      <input type="number" placeholder="Montant" class="p-2 border border-gray-300 rounded-md">
      <input type="number" placeholder="Quantité" class="p-2 border border-gray-300 rounded-md">
      <button class="bg-green-500 text-white px-4 py-2 rounded-md">Ajouter</button>
    </div>
  </div>

  <!-- Sell Form (Hidden by default) -->
  <div class="sell-form roll-down hidden mt-4">
    <div class="form-container">
      <input type="number" placeholder="Quantité" class="p-2 border border-gray-300 rounded-md">
      <button class="bg-red-500 text-white px-4 py-2 rounded-md">Vendre</button>
    </div>
  </div>
`;

// Append the product div to a parent container (e.g., a div with id="product-list")
document.getElementById('product-list').appendChild(productDiv);

}


 initializeList()



document.querySelectorAll('.edit-btn').forEach((btn, idx) => {
  btn.addEventListener('click', function () {
    toggleForm(idx, 'edit-form');
  });
});

document.querySelectorAll('.buy-btn').forEach((btn, idx) => {
  btn.addEventListener('click', function () {
    toggleForm(idx, 'buy-form');
  });
});

document.querySelectorAll('.sell-btn').forEach((btn, idx) => {
  btn.addEventListener('click', function () {
    toggleForm(idx, 'sell-form');
  });
});
