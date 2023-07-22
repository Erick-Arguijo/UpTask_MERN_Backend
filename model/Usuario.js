const mongoose = require('mongoose')
const {Schema, model} = mongoose
const bcrypt = require('bcrypt');

const usuarioSchema = new Schema({
    nombre : {
        type: 'String',
        require:true,
        trim:true
    },
    correo : {
        type: 'String',
        require:true,
        trim:true,
        unique:true
    },
    contraseña:{
        type: 'String',
        require:true,
        trim:true
    },
    confirmacion:{
        type: 'Boolean',
        default:false
    },
    token:{
        type: 'String'
    }

},{
    timestamps:true  //Para agregar dos campos mas (Fecha de creado y actualizado)
}
)


usuarioSchema.pre('save', async function(next) {
    //Si no se esta modificando la contraseña no se volvera a encriptar (Se saltara el middleware)
    if(!this.isModified("contraseña")) {
        //console.log('No estoy modificando')
        return next();
    }
    //console.log('Estoy modificando')
    const salt = bcrypt.genSaltSync( 10 ) ; 
    this.contraseña = bcrypt.hashSync( this.contraseña, salt ) ;
  });

module.exports = model('Usuario', usuarioSchema)