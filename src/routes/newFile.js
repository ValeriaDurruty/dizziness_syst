const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const { router } = require('./users');

router.get('/delete/:PK_Profesional', isLoggedIn, async (req, res) => {
    const { PK_Profesional } = req.params;
    /* var confirm = confim('¿Está seguro que desea eliminar al paciente ' + nombre + ' ' + apellido + '?');
    if (confirm){ */
    await pool.query('DELETE FROM Usuario WHERE FK_Profesional = ?', [PK_Profesional]);
    await pool.query('DELETE FROM Profesional WHERE PK_Profesional = ?', [PK_Profesional]);
    req.flash('success', 'Profesional eliminado correctamente');
    res.redirect('/users');
    /*  }else{
         res.redirect('/pacientes');
     } */
});
