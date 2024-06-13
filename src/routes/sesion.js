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

router.get('/add', isLoggedIn, async (req, res) => {
    const pacientes = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.FK_Profesional = ?', [req.user.FK_Profesional]);
    const ejercicios = await pool.query('SELECT PK_Ejercicio, nombre AS nombreEjercicio FROM Ejercicio');
    
    res.render('sesion/add', { pacientes, ejercicios});
});

router.post('/add', isLoggedIn, async (req, res) => {
    try{
        const { paciente, fechaActivacion, repeticiones, ejercicioCount } = req.body;

        //Verificar si el paciente tiene sesiones previas y contar cuántas tiene
        const sesionesCountResult = await pool.query('SELECT COUNT(*) AS count FROM Sesion WHERE FK_Paciente = ?', [paciente]);
        const sesionesCount = sesionesCountResult[0].count;  // Extraer el valor de count
        const sesiones = sesionesCount +1;
        console.log(sesiones);


        const newSesion = {
            nroSesion: sesiones,
            fechaActivacion,
            repeticiones,
            FK_Paciente: paciente
        };
        console.log(newSesion);

        const result = await pool.query('INSERT INTO Sesion SET ?', [newSesion]);
        
        // Obtener el idSesion de la sesión recién agregada
        const FK_Sesion = result.insertId;

        console.log(req.body);
        console.log(ejercicioCount);
        //Bucle para insertar tantas asignaciones como ejercicios haya
        for (let i = 1; i <= ejercicioCount; i++) {
            const newAsignacion = {
                repeticiones: req.body[`ejercicioReps${i}`],
                FK_Sesion,
                FK_Ejercicio: req.body[`ejercicioId${i}`]
            };
            await pool.query('INSERT INTO Asignacion SET ?', [newAsignacion]);
        }

        req.flash('success', 'Sesión generada correctamente');
        res.redirect(`/sesion/detail/${FK_Sesion}`);

    }catch(error){
        //Manejo de errores
        console.error(error);
        console.log(error);
    }

});

router.get('/detail/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener detalles de la sesión
        const sesionResult = await pool.query('SELECT * FROM Sesion WHERE PK_Sesion = ?', [id]);
        const sesion = sesionResult[0];

        // Formatear la fecha
        sesion.fechaActivacionFormatted = moment(sesion.fechaActivacion).format('DD-MM-YYYY');

        // Obtener detalles de las asignaciones de ejercicios de la sesión
        const asignacionesResult = await pool.query('SELECT * FROM Asignacion INNER JOIN Ejercicio ON FK_Ejercicio = PK_Ejercicio WHERE FK_Sesion = ?', [id]);
        const asignaciones = asignacionesResult;

        // Obtener detalles del paciente
        const pacienteResult = await pool.query('SELECT * FROM Usuario WHERE FK_Paciente = ?', [sesion.FK_Paciente]);
        const paciente = pacienteResult[0];

        res.render('sesion/detail', { sesion, asignaciones, paciente });
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
});

router.get('/list', isLoggedIn, async (req, res) => {
    const pacientes = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.FK_Profesional = ?', [req.user.FK_Profesional]);
    //const sesiones = await pool.query('SELECT * FROM `sesion` WHERE FK_Paciente = ?', [sesion.FK_Paciente]);
    //const asignaciones = await pool.query('SELECT * FROM `asignacion` WHERE FK_Sesion = ?', [sesion.PK_Sesion]);
    //count de las asignaciones por sesion
    //cant_asignaciones = asignaciones.length;
    
    //res.render('sesion/list', { pacientes, sesiones, cant_asignaciones});
});

router.get('/active_sesion', isLoggedIn, async (req, res) => {
    const ejercicios = await pool.query('SELECT * FROM asignacion a INNER JOIN ejercicio e ON a.FK_Ejercicio = e.PK_Ejercicio WHERE a.FK_Sesion = 2');
    console.log(req.body.FK_Sesion);
    console.log(ejercicios);
    res.render('sesion/active_sesion', { ejercicios});
});

module.exports = router;