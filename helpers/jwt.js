const jwt = require('jsonwebtoken')

const generarJWT = async (payload) => {
  try {
    const token =  jwt.sign(payload, process.env.SecretKey, {expiresIn:'1d'})
    return token
  } catch (error) {
    throw new Error('No se pudo crear el JSON Web Token')
  }
}

module.exports = {generarJWT}
