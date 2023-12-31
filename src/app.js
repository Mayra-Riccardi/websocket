const express = require("express");
const { api } = require('./routes');
const http = require('http')
const path = require('path');
const handlebars = require('express-handlebars')// importamos handlebars como motor de plantilla
const { Server } = require("socket.io");
const socketManager = require('./websocket')

const app = express();
const server = http.createServer(app) // server http montado con express
const io = new Server(server) // web socket montado en el http

// Agregar el middleware para 'req.io' esté disponible
app.use((req, res, next) => {
  req.io = io;
  next();
});



// Configuración de handlebars
app.engine('handlebars', handlebars.engine()) // registramos handlebars como motor de plantillas
app.set('views', path.join(__dirname, '/views')); // Directorio de vistas
app.set("view engine", "handlebars"); // Establecer Handlebars como motor de plantilla

// MIDDLEWARES
//app.use(express.urlencoded({ extend: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname + '/public')))

app.use('/', api);

// web socket
io.on('connection', socketManager)

// SERVIDOR
const port = 8080;

server.listen(port, () => {
  console.log(`🚀 Server is up and running on port ${port} 🚀`);
});
