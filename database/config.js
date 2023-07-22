const mongoose = require('mongoose');

const connection = async() => {
    try {
      mongoose.connect(process.env.DB_CNN);
      return console.log('conectados a la base de datos')
  } catch (error) {
    throw new Error('No se pudo conectar a la base de datos')
  }
}

module.exports = {connection}
