const mongoose = require('mongoose')
const {Schema, model} = mongoose

const tareaSchema = new Schema({
    nombre:{
        type:String,
        required:true,
        trim:true,
    },
    descripcion:{
        type:String,
        required:true,
        trim:true,
    },
    fechaEntrega:{
        type:Date,
    
    },
    prioridad:{
        type:String,
        required:true,
        enum:['Baja', 'Media', 'Alta']
    },
    estado:{
        type:Boolean,
        required:true,
        default:false
    },
    proyecto:{
        type: Schema.Types.ObjectId,
        ref:'Proyecto'
    },
    usuario:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    }

},
{
    timestamps:true  //Para agregar dos campos mas (Fecha de creado y actualizado)
}
)

module.exports = model('Tarea', tareaSchema)