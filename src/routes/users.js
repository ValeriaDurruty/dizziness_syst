const express = require('express');
const router = express.Router();
exports.router = router;

//conexión a la db
const pool = require('../database');
//Middleware para verificar si el usuario está autenticado
const { isLoggedIn } = require('../lib/auth');
// Importa el archivo helpers.js que contiene los métodos de cifrado
const helpers = require('../lib/helpers');
const { hash } = require('bcryptjs');


router.get('/listActivate', isLoggedIn, async (req, res) => {
    const users = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Profesional p INNER JOIN Usuario u ON p.PK_Profesional = u.FK_Profesional WHERE p.validar = 0');
    res.render('users/listActivate', { users});
});

router.get('/', isLoggedIn, async (req, res) => {
    const users = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Profesional p INNER JOIN Usuario u ON p.PK_Profesional = u.FK_Profesional WHERE p.validar = 1');
    res.render('users/list', { users});
});

// Arreglar, no funciona, no se muestra el valor de cantidad
router.get('/profile', isLoggedIn, async (req, res) => {
    const cantidad = await pool.query('SELECT COUNT(*) FROM profesional WHERE validar = 0;');
    console.log(cantidad);
    res.render('users/profile', {cantidad: Number(cantidad)});
});

router.get('/activate/:PK_Profesional', isLoggedIn, async (req, res) => {
    try {
        const { PK_Profesional } = req.params;
        await pool.query('UPDATE Profesional p SET validar = 1 WHERE p.PK_Profesional = ?', [PK_Profesional]);
        req.flash('success', 'Cuenta activada');
        res.redirect('/users');
    } catch(error) {
        console.error(error);
        req.flash('message', 'Error al activar cuenta');
        res.redirect('/users');
    }
});

router.get('/delete/:PK_Profesional', isLoggedIn, async (req, res) => {
    const { PK_Profesional } = req.params;
    /* var confirm = confim('¿Está seguro que desea eliminar al paciente ' + nombre + ' ' + apellido + '?');
    if (confirm){ */
        await pool.query('DELETE FROM Usuario WHERE FK_Profesional = ?', [PK_Profesional]);
        await pool.query('DELETE FROM Profesional WHERE PK_Profesional = ?', [PK_Profesional]);
        req.flash('success', 'Usuario eliminado correctamente');
        res.redirect('/users');
   /*  }else{
        res.redirect('/pacientes');
    } */
});


router.get('/edit/:PK_Profesional', isLoggedIn, async (req, res) => {
    try {
        const { PK_Profesional } = req.params;
        const prof = await pool.query('SELECT u.*, p.* FROM Profesional p INNER JOIN Usuario u ON p.PK_Profesional = u.FK_Profesional WHERE p.PK_Profesional = ?', [PK_Profesional]);
        console.log(prof[0]);
        res.render('users/edit', { prof: prof[0] });
    } catch(error) {
        console.error(error);
        req.flash('message', 'Error al obtener datos del profesional');
        res.redirect('/users');
    }
});

router.post('/edit/:PK_Profesional', isLoggedIn, async (req, res) => {
    
        const { PK_Profesional } = req.params;
        const { nombre, apellido, email, tipoMatricula, matricula } = req.body;

        const newUsuario = {
            nombre,
            apellido,
            email
        };

        const upd_prof = await pool.query('UPDATE Profesional p SET tipoMatricula = ?, matricula = ? WHERE p.PK_Profesional = ?', [tipoMatricula, matricula, PK_Profesional]);
        const upd_user = await pool.query('UPDATE Usuario SET ? WHERE FK_Profesional = ?', [newUsuario, PK_Profesional]);

        if (upd_prof && upd_user){
            req.flash('success', 'Usuario modificado correctamente');
            res.redirect('/users');
        }else{
            req.flash('message', 'Error al modificar usuario');
            res.redirect('/users/edit/' + PK_Profesional);
        }
});

module.exports = router;