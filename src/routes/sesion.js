const express = require('express');
const router = express.Router();

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
        const sesionesCount = await pool.query('SELECT COUNT(*) AS count FROM Sesion WHERE FK_Paciente = ?', [paciente]);
        const sesiones = sesionesCount +1;
        console.log(sesiones);


        const newSesion = {
            nroSesion: sesiones,
            fechaActivacion,
            repeticiones,
            FK_Paciente: paciente
        };

        const result = await pool.query('INSERT INTO Sesion SET ?', [newSesion]);
        
        // Obtener el idSesion de la sesión recién agregada
        const FK_Sesion = result.insertId;

        console.log(req.body);
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
        res.redirect('/profile');

    }catch(error){
        //Manejo de errores
        console.error(error);
        console.log(error);
    }

});

router.get('/active_sesion', isLoggedIn, async (req, res) => {
    const ejercicios = await pool.query('SELECT * FROM asignacion a INNER JOIN ejercicio e ON a.FK_Ejercicio = e.PK_Ejercicio WHERE a.FK_Sesion = 2');
    console.log(req.body.FK_Sesion);
    console.log(ejercicios);
    res.render('sesion/active_sesion', { ejercicios});
});

module.exports = router;