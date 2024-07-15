const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const handlebars = require('handlebars');

const { database } = require('./keys');

//inicializamos la aplicación
const app = express();
require('./lib/passport');

// Registra el helper 'eq' en Handlebars
handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

// Registra el helper 'switch' en Handlebars
handlebars.registerHelper('switch', function(value, options) {
    this._switch_value_ = value;
    var html = options.fn(this);
    delete this._switch_value_;
    return html;
  });
  
  // Registra el helper 'case' en Handlebars
  handlebars.registerHelper('case', function(value, options) {
    if (value == this._switch_value_) {
      return options.fn(this);
    }
  });

//Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
  }))
app.set('view engine', '.hbs');

//Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUnitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//Routes (URL de nuestro servidor)
app.use(require('./routes/index'));
app.use(require('./routes/autenticacion'));
app.use('/users', require('./routes/users'));
app.use('/pacientes', require('./routes/pacientes'));
app.use('/sesion', require('./routes/sesion'));

//Public (todo el código que el navegador puede acceder)
app.use(express.static(path.join(__dirname, 'public')));

//Starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});