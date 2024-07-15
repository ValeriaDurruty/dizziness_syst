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
    if (req.query.pacienteId) {
        const pacienteId = req.query.pacienteId;
        const sesiones = await pool.query(`
            SELECT s.*, 
                   (SELECT COUNT(*) FROM Asignacion a WHERE a.FK_Sesion = s.PK_Sesion) as cantEjercicios,
                   e.nombre as ejercicio, 
                   a.repeticiones as repeticionesxEjercicio 
            FROM Sesion s
            LEFT JOIN Asignacion a ON s.PK_Sesion = a.FK_Sesion
            LEFT JOIN Ejercicio e ON a.FK_Ejercicio = e.PK_Ejercicio
            WHERE s.FK_Paciente = ?`, [pacienteId]);
        res.json(sesiones);
        console.log(sesiones);
    } else {
        const pacientes = await pool.query('SELECT p.*, u.nombre AS nombre, u.apellido AS apellido, u.email AS email FROM Paciente p INNER JOIN Usuario u ON p.PK_Paciente = u.FK_Paciente WHERE p.FK_Profesional = ?', [req.user.FK_Profesional]);
        res.render('sesion/list', { pacientes });
    }
});

//------------------------------------------------- PRUEBA ----------------------------------------------------------------------------

// Ruta para mostrar los detalles de la sesión
router.get('/start_session/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        // Obtener detalles de la sesión del paciente
        const sessionResult = await pool.query('SELECT * FROM Sesion WHERE PK_Sesion = ?', [id]);
        const session = sessionResult[0];

        // Obtener asignaciones de ejercicios de la sesión
        const assignmentsResult = await pool.query('SELECT e.nombre, e.video, e.descripcion FROM Asignacion a INNER JOIN Ejercicio e ON a.FK_Ejercicio = e.PK_Ejercicio WHERE a.FK_Sesion = ?', [id]);
        const assignments = assignmentsResult;

        res.render('sesion/session_detail', {
            session,
            assignments,
            totalAssignments: assignments.length
        });
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
});

// Ruta para iniciar los ejercicios
router.get('/start_exercises/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener asignaciones de ejercicios de la sesión
        const assignmentsResult = await pool.query('SELECT e.nombre, e.video, e.descripcion, a.repeticiones FROM Asignacion a INNER JOIN Ejercicio e ON a.FK_Ejercicio = e.PK_Ejercicio WHERE a.FK_Sesion = ?', [id]);
        const assignments = assignmentsResult;

        console.log(`Ejercicios obtenidos: ${JSON.stringify(assignments)}`);
        
        res.render('sesion/exercises', { assignments, id });
        console.log("aqui paso el id", id);
    } catch (error) {
        console.error(`Error al iniciar los ejercicios para sesión ID: ${id}`, error);
        res.redirect('/profile');
    }
});

router.get('/complete/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        console.log("en complete el id es:", id);
        const fechaRealizacion = moment().format('YYYY-MM-DD');
        console.log("fecha de realizacion", fechaRealizacion);
        const result = await pool.query('UPDATE Sesion SET fechaRealizacion = ? WHERE PK_Sesion = ?', [fechaRealizacion, id]);
        console.log("resultado", result);

        res.redirect('/sesion/congratulations');
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
});

router.get('/congratulations', isLoggedIn, (req, res) => {
    res.render('sesion/congratulations');
});


module.exports = router;