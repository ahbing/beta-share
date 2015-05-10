var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var multer = require('multer');
//引入路由
var index = require('./routes/index');
var admin = require('./routes/admin');
var app = express();
//解决  413 (request entity too large)
app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
app.use(bodyParser.json({limit: '50mb'}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(multer({
  dest: './public/uploads',
  rename: function (fieldname, filename){
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  }
}));
//session 存在内存
app.use(session({
  secret: 'hellobetahouse',
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  resave: true,
  saveUninitialized: true
}));

//下面的第一个参数就是一个url的前面部分 会拼接app.get的第一个参数
  //用户
app.use('/',index);
  //后台
app.use('/admin',admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

