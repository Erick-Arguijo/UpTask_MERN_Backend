
const mongoose = require('mongoose')
const { Schema, model } = mongoose;

const proyectoSchema = new Schema({
    nombre :{
        type: String,
        required: true,
        trim: true
    },
    descripcion:{
        type: String,
        required: true,
        trim: true
    },
    fechaEntrega:{
        type: Date,
        required: true,
    },
    cliente:{
        type: String,
        required: true,
        trim: true
    },
    creador:{
        type: Schema.Types.ObjectId,
        ref:'Usuario'
    },
    colaboradores:[{
        type: Schema.Types.ObjectId,
        ref:'Usuario'
    }],
    tareas:[{
        type: Schema.Types.ObjectId,
        ref:'Tarea'
    }]
    
},
{
    timestamps:true  //Para agregar dos campos mas (Fecha de creado y actualizado)
}
)

module.exports = model('Proyecto', proyectoSchema)