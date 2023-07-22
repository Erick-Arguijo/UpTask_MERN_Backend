const express = require('express');
const { connection } = require('./database/config');
const cors = require('cors')
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser')

require('dotenv').config();


const app = express()
const data = connection()

const whitelist = [process.env.FORNTEND_URL]
const corsOptions = { origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null,true)
        }else{
            callback(new Error("Error de Cors"))
        }
    }
}


app.use(express.json())
app.use(cors(whitelist))
//app.use(cookieParser())


//ROUTING

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/proyecto', require('./routes/projectRoutes'))
app.use('/api/tarea', require('./routes/homeworkRouter'))


const server = app.listen(process.env.PORT, () => {
    console.log('listening on http://localhost:4000')
})  


const io = new Server(server , { 
    pingTimeout:20000,
    cors: {
    origin: process.env.FRONTEND_URL 
  }});

io.on("connection", (socket) => {
    
    socket.on("abrir proyecto", (proyecto) => {
        //console.log('Sala creada para el proyecto: '+ proyecto)
      socket.join(proyecto);
    })
    
    socket.on('Nueva Tarea', (tarea) =>{
        const proyecto = tarea.nuevaTarea.proyecto
        //console.log(`Tarea distrubuida en la room ${proyecto} `)
        //console.log(tarea) 
      socket.in(proyecto).emit('tareaAgregada', tarea.nuevaTarea)
    })

    socket.on('Eliminar Tarea', tarea =>{
        const proyecto = tarea.proyecto
        socket.in(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('Editar Tarea', tarea =>{
        socket.in(tarea.proyecto).emit('tarea actualizada', tarea)
    })

});