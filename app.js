var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

//router path 설정
var csvRouter = require('./routes/csv');
var userRouter = require('./routes/users');
var indexRouter = require('./routes/index');

//session과 passport 사용 선언
app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//database 연결
var mysqlDB = require('./config/mysql-db');
mysqlDB.connect(function (err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    } else {
        console.log("연결에 성공하였습니다.");
    }
});

//헤더 정보
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/', userRouter);
app.use('/index',indexRouter);
app.use('/csv', csvRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var port = 5555;
app.listen(port, function(){

    console.log('Server Start, Port : ' + port);
});

module.exports = app;
