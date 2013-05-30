
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ,mysql = require('mysql');

var app = express();

// all environments
app.set('port', process.env.PORT || 3100);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


function logeo(req, res, next){
  if(req.session.user){
    next();
  }else{
    res.redirect('/login');
  }
};

function BD(){
  var cliente = mysql.createConnection({
    user: 'daniel',
    password: 'Dan1e/29',
    host: 'localhost',
    port: 3306,
    database: 'final'
  });
  return cliente;
}


app.get('/', routes.index);
app.get('/users', user.list);

app.get('/login', function(req, res){
	res.render('login', {title: 'Ingreso'});
});

app.get('/privada', logeo, function(req, res){
	res.render('privada', {title: 'pagina del administrador'});
});

app.post('/autenticar',function(req,res){
	var objBD=BD();
  var usuario = req.body.txtUsuario;
  var pass = req.body.txtPass;
  objBD.query('SELECT * FROM usuario WHERE nombre = "'+ usuario +'" AND clave = "'+ pass +'" AND activo="si"',function(error, resultado, fila){
     
     if (!error){
      console.log(resultado.length);
      if(resultado.length > 0){
        req.session.user = usuario;
        console.log(resultado[0].tipo);
        if (resultado[0].tipo=='administrador'){
          res.redirect('/privada');
        }else{
          res.render('publica', {title: resultado[0].alias});
        }
        
      }else{
        res.send('El Usuario No Existe o fue eliminado');
      }
     }else{
      console.log('ERROR');
     }
  });
});

app.post('/eliminar', function(req,res){
  var objBD=BD();
  var usuario = req.body.usuelim;
  objBD.query('UPDATE usuario SET activo="no" WHERE nombre = "'+ usuario+'"');
  res.end();
});

app.post('/actualizar', function(req,res){
  var objBD=BD();
  var usuarioa = req.body.usub;
  var alias= req.body.aliasact;
  var nombre= req.body.usueact;
  var clave = req.body.passact;
  var tipo= req.body.tipoact;
  var activo = req.body.activo;
  objBD.query('UPDATE usuario SET alias="'+alias+'", nombre="'+nombre+'", clave="'+clave+'", tipo="'+tipo+'", activo="'+activo+'" WHERE nombre = "'+ usuarioa+'"');
  res.end();
});

app.get('/salir', function(req, res){
  delete req.session.user;
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});