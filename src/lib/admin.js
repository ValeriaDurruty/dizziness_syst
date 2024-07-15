const helpers = require('./helpers'); // Importa el archivo helpers.js que contiene los métodos de cifrado

const plaintextPassword = 'secureSystemMAD';

// Cifra la contraseña
helpers.encryptPassword(plaintextPassword)
  .then(hash => {
    console.log(hash); // Imprime el hash generado
  })
  .catch(error => {
    console.error(error); // Manejo de errores
  });
