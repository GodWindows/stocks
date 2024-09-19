const func = async () => {
    const response = await versions.ping()
}

func()
/* const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()}). By the way, my name is ${versions.my_name}` */
