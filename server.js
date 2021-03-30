const http = require('http')
const app = require('./app')

http.createServer(app).listen(5555,() => {
    console.log(`Backend Server is running on 5555..`)
})