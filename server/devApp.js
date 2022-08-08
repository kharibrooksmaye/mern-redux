const nodemon = require('nodemon')
const ngrok = require('ngrok')

nodemon({
  script: 'server.js',
  ext: 'js'
})

let url = null;

nodemon.on('start', async () => {
    if(!url){
        url = await ngrok.connect({
            authtoken: '1aaC0EAO72gE1ovyN7CGPLIPCaU_2bY8Q4d3ruMtHTTZWMScF',
            subdomain: 'zephyrhook',
            proto: 'http',
            addr: '5000'
        })
        console.log(`Server now available at ${url}`)
    }
}).on('quit', async () => {
  console.log('killing app.js')
  await ngrok.kill()
}).on('restart', (files) => {
    console.log(`App restarted due to ${files}`)
})