const jwt = require('jsonwebtoken');
const Usuario = require('../model/Usuario');
const validarJWT = async (req, res, next) => {
    const token = req.header('x-token')
    
    if (token) {
       try {
    //console.log(token)
            //console.log(process.env.SecretKey)
            const payload = jwt.verify(token , `${process.env.SecretKey}`)
            //console.log(payload)
            const usuario = await Usuario.findOne({_id:payload.id}).select("-contraseña -confirmacion -token -createdAt -updatedAt -__v")
            req.usuario = usuario
            
            next()
        } catch (error) {
            console.log(error)
            res.status(500).json({ok:false, msj:'Token expirado'})
        }      
    }else{
        res.status(404).json({ok:false, msj:'No hay token'})
    }

    
}

module.exports = {validarJWT}