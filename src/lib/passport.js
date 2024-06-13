const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const router = express.Router();

//conexión a la db
const pool = require('../database');
const helpers = require('./helpers');
const e = require('connect-flash');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, email, pass, done) => {
    if (!email || !pass) {
        console.log('Por favor ingrese su email y contraseña');
        return done(null, false, req.flash('message', 'Por favor ingrese su email y contraseña'));
    };
    const rows = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (rows.length > 0) {
        const user = rows[0];
        if (user.FK_Rol == 2) {
            const rows = await pool.query('SELECT * FROM Profesional WHERE PK_Profesional = ?', [user.FK_Profesional]);
            if (rows[0].validar == 0) {
                return done(null, false, req.flash('message', 'El usuario no ha sido validado por el administrador. Aguarde 48 hs. y por favor intente nuevamente.'));
            }
        }
        const validPassword = await helpers.matchPassword(pass, user.pass);
        if (validPassword) {
            done(null, user, req.flash('success', 'Bienvenido ' + user.nombre + ' ' + user.apellido + '!!'));
        } else {
            done(null, false, req.flash('message', 'Contraseña incorrecta'));
        }
    }else{
        return done(null, false, req.flash('message', 'El usuario no existe'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    
    const { nombre, apellido, tipoMatricula, matricula } = req.body;
    const newProfesional = {
        tipoMatricula,
        matricula,
        validar: 0
    };

    const altaProf = await pool.query('INSERT INTO Profesional SET ?', [newProfesional]);
    
    // Obtener el idProfesional del profesional recién agregado
    const PK_Profesional = altaProf.insertId;
    if (PK_Profesional == null || PK_Profesional == 0) {
        console.log('No se pudo cargar el profesional');
        return done(null, false, req.flash('message', 'No se pudo registrar al usuario. Intente nuevamente.'));
    };

    const newUsuario = {
        nombre,
        apellido,
        email,
        pass: password,
        FK_Rol: 2,
        FK_Profesional: PK_Profesional
    };

    newUsuario.pass = await helpers.encryptPassword(password);

    const result = await pool.query('INSERT INTO Usuario SET ?', [newUsuario]);
    newUsuario.PK_Usuario = result.insertId;

    return done(null, newUsuario);
}));

//Serializar el usuario: guardo el id del usuario
passport.serializeUser((user, done) => {
    done(null, user.PK_Usuario);
  });
  
//Deserializar el usuario: obtengo el id del usuario para obtener los datos del usuario
passport.deserializeUser(async (PK_Usuario, done) => {
    const rows = await pool.query('SELECT u.*, p.validar FROM Usuario u LEFT JOIN Profesional p ON u.FK_Profesional = p.PK_Profesional WHERE u.PK_Usuario = ?', [PK_Usuario]);
    done(null, rows[0]);
});