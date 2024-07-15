const bcrypt = require('bcryptjs');

const helpers = {};

//Método para cifrar la contraseña en el registro
helpers.encryptPassword = async (password) => {
    //Genero un HASH de la contraseña, lo ejecuto 10 veces
    const salt = await bcrypt.genSalt(10);
    //Cifro la contraseña en base al HASH generado
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

//Método para comparar la contraseña ingresada con la contraseña cifrada en el login
helpers.matchPassword = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword);
    } catch (e) {
        console.log(e);
    }
};

module.exports = helpers;