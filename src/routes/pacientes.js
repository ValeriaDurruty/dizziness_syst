const express = require('express');
const router = express.Router();
const moment = require('moment');

//conexión a la db
const pool = require('../database');
//Middleware para verificar si el usuario está autenticado
const { isLoggedIn } = require('../lib/auth');
// Importa el archivo helpers.js que contiene los métodos de cifrado
const helpers = require('../lib/helpers');
const { hash } = require('bcryptjs');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('pacientes/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    try{
        const { nombre, apellido, tipoDoc, documento, fechaNacimiento, email } = req.body;
        const newPaciente = {
            tipoDoc,
            documento,
            fechaNacimiento,
            FK_Profesional: req.user.FK_Profesional
        };

        const result = await pool.query('INSERT INTO Paciente SET ?', [newPaciente]);
        
        // Obtener el idPaciente del paciente recién agregado
        const FK_Paciente = result.insertId;

        // Cifra la contraseña
        const hash = await helpers.encryptPassword(documento);

        const newUsuario = {
            nombre,
            apellido,
            email,
            pass: hash,
            FK_Rol: 3,
            FK_Paciente
        };

        const alta = await pool.query('INSERT INTO Usuario SET ?', [newUsuario]);
        const PK_Paciente = alta.insertId;
        console.log(PK_Paciente);
        if (alta){
            req.flash('success', 'Paciente agregado correctamente');
            console.log('Paciente agregado correctamente');
            // Renderizar la vista de resumen del paciente
            res.redirect(`/pacientes/detail/${PK_Paciente}`);
        }else{
            req.flash('message', 'Error al agregar paciente');
            res.redirect('/pacientes/add');
        }
    }catch(error){
        //Manejo de errores
        console.error(error);
        console.log(error);
    }
});

router.get('/detail/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        // Obtener detalles de la sesión
        const PacienteResult = await pool.query('SELECT u.nombre as nombre, u.apellido as apellido, p.tipoDoc as tipoDoc, p.documento as documento, p.fechaNacimiento as fechaNacimiento, u.email as email FROM Usuario u INNER JOIN PACIENTE p ON u.FK_Paciente = p.PK_Paciente WHERE u.PK_Usuario = ?', [id]);
        console.log(PacienteResult);
        const paciente = PacienteResult[0];
        console.log(paciente);

        // Formatear la fecha
        paciente.fechaNacimientoFormatted = moment(paciente.fechaNacimiento).format('DD-MM-YYYY');

        res.render('pacientes/detail', { paciente });
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
});

router.get('/', isLoggedIn, async (req, res) => {
    const pacientes = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.FK_Profesional = ?', [req.user.FK_Profesional]);
    res.render('pacientes/list', { pacientes});
});

router.get('/delete/:PK_Paciente', isLoggedIn, async (req, res) => {
    const { PK_Paciente } = req.params;
    //Consulta para obtener los datos del paciente
    const pacienteResult = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.PK_Paciente = ?', [PK_Paciente]);
    const paciente = pacienteResult[0];
    // Formatear la fecha
    paciente.fechaNacimientoFormatted = moment(paciente.fechaNacimiento).format('DD-MM-YYYY');
    res.render('pacientes/delete', { paciente, PK_Paciente });
});

router.get('/confirm-delete/:PK_Paciente', isLoggedIn, async (req, res) => {
    const { PK_Paciente } = req.params;
        await pool.query('DELETE FROM Usuario WHERE FK_Paciente = ?', [PK_Paciente]);
        await pool.query('DELETE FROM Paciente WHERE PK_Paciente = ?', [PK_Paciente]);
        req.flash('message', 'Paciente eliminado correctamente');
        res.redirect('/pacientes');
});

router.get('/edit/:PK_Paciente', isLoggedIn, async (req, res) => {
    const { PK_Paciente } = req.params;
    const paciente = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.PK_Paciente = ?', [PK_Paciente]);
    // Formatear la fecha
    fechaNacimientoFormatted = moment(paciente[0].fechaNacimiento).format('YYYY-MM-DD');
    res.render('pacientes/edit', {paciente: paciente[0], fechaNacimientoFormatted });
});

router.post('/edit/:PK_Paciente', isLoggedIn, async (req, res) => {
    const { PK_Paciente } = req.params;
    const { nombre, apellido, email, fechaNacimiento, tipoDoc,documento } = req.body;

    // Cifra la contraseña
    const hash = await helpers.encryptPassword(documento);

    const newUsuario = {
        nombre,
        apellido,
        email,
        pass: hash
    };
    const newPaciente = {
        fechaNacimiento,
        tipoDoc,
        documento
    };
    const upd_pac = await pool.query('UPDATE Paciente SET ? WHERE PK_Paciente = ?', [newPaciente, PK_Paciente]);
    const upd_user = await pool.query('UPDATE Usuario SET ? WHERE FK_Paciente = ?', [newUsuario, PK_Paciente]);
    
    if (upd_pac){
        //Flash utiliza 2 parámetros, el primero es el nombre del mensaje (como lo vamos a guardar) y el segundo es el mensaje
        req.flash('success', 'Paciente modificado correctamente');
        res.redirect('/pacientes');
    }else{
        req.flash('message', 'Error al modificar paciente');
        res.redirect('/pacientes/edit/' + PK_Paciente);
    }
});

module.exports = router;