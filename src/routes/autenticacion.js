const express = require('express');
const router = express.Router();
const app = express();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

//conexión a la db
const pool = require('../database');

//Renderiza el formulario de registro
router.get('/signup', (req, res) => {
    res.render('auth/signup');

});

//Recibe los datos del formuario de registro
router.post('/signup', passport.authenticate('local.signup', {
    //Se define a donde quiero que me lleve cuando la autenticación es correcta y cuando falla
    successRedirect: '/registro_exitoso',
    failureRedirect: '/signup',
    failureFlash: true
}));

//Renderiza el formulario de inicio de sesión
router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

//Recibe los datos del formulario de inicio de sesión
router.post('/signin', isNotLoggedIn, async (req, res, next) => {

    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, async (req, res) => {
    const validar = req.user.validar;
    const PK_Rol = req.user.FK_Rol;

    if (validar == 0) {
        //Logout
        req.logOut(req.user, err => {
            if (err) return next(err);
            res.redirect('/signin');
        });
    }else{

    //Renderizo la vista correspondiente al rol
    switch (PK_Rol) {
        case 1:
            const resCuentasV = await pool.query('SELECT COUNT(*) FROM profesional WHERE validar = 0;');
            const cantidadCuentas = resCuentasV[0]['COUNT(*)'];
            // console.log('La cantidad que quiero mostrar es: ', cantidadCuentas);
            res.render('admin_view', { cantidadCuentas });
        case 2:
            const resPac = await pool.query('SELECT COUNT(*) FROM paciente WHERE FK_Profesional = ?', [req.user.FK_Profesional]);
            const cantidadPac = resPac[0]['COUNT(*)'];
            res.render('prof_view', { cantidadPac });
            break;
        case 3:
            const resSesion = await pool.query('SELECT COUNT(*) FROM sesion WHERE fechaActivacion <= CURDATE() AND fechaRealizacion IS NULL AND FK_Paciente = ?', [req.user.FK_Paciente]);
            const cantidadSes = resSesion[0]['COUNT(*)'];
            const resFirstSesion = await pool.query('SELECT * FROM sesion WHERE fechaActivacion <= CURDATE() AND fechaRealizacion IS NULL AND FK_Paciente = ? ORDER BY PK_Sesion DESC LIMIT 1', [req.user.FK_Paciente]);
            const firstSesion = resFirstSesion[0];

            res.render('paciente_view', { cantidadSes, firstSesion });
            break;
        default:
            res.redirect('/signin');
            break;
    }
};
});

router.get('/registro_exitoso', (req, res) => {
    res.render('registro_exitoso');
});

router.get('/changepassword', isLoggedIn, (req, res) => {
    res.render('auth/changepassword');
});

router.post('/changepassword', async (req, res) => {
    const { oldPass, newPass, confirmPass, PK_Usuario } = req.body;
    
    const rows = await pool.query('UPDATE usuario SET pass = ? WHERE idUsuario = ?', [newPass, PK_Usuario]);
    if (rows.affectedRows > 0) {
        req.flash('success', 'Contraseña modificada correctamente')
    } else {
        req.flash('message', 'Error al modificar la contraseña')
    }
});

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logOut(req.user, err => {
        if (err) return next(err);
        res.redirect('/signin');
    });
});

module.exports = router;