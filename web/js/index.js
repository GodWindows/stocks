const save = async (data) => {
    const response = await tools.saveProduct(data);
}

function add_product() {
    console.log("clicked")
    var name = $("#name").val()
    var amount = $("#amount").val()
    var price = $("#price").val()
    if (name!="" && amount !="" && price !="" && price>=0 && amount>0) {
        const product = new Map();

        product.set('name', name);
        product.set('price', price);
        product.set('amount', amount);        

        save(product);
        toastr.success('Produit ajouté !', '', { timeOut: 3000, positionClass: "toast-top-left" });

        $("#name").val("");
        $("#amount").val("");
        $("#price").val("");

    }else{
        //trigger an error toast
    }
}

document.getElementById("submit").addEventListener("click", add_product);
