const save = async (data) => {
    const response = await tools.save(data);
}



function add_product() {
    console.log("clicked")
    var name = $("#name").val()
    var amount = $("#amount").val()
    var price = $("#price").val()
    if (name!="" && amount !="" && price !="") {
        const product = new Map();

        product.set('name', name);
        product.set('price', price);
        product.set('amount', amount);        

        save(product);

    }else{
        //trigger an error toast
    }
}


document.getElementById('submit').addEventListener('click', function () {
    const name = $('#name').val();
    const amount = $('#amount').val();
    const price = $('#price').val();

    if (!name || amount < 0 || price < 0) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }
    add_product();
    alert(`Produit: ${name}\nQuantité: ${amount}\nPrix: ${price} FCFA`);
  });