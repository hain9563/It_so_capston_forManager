var express = require('express');
var router = express.Router();

var mysqlDB = require('../config/mysql-db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// /users

/* GET users listing. /users */
router.get('/', function(req, res, next) {
  res.render('bootEX', {
    title: 'MUSE'
  });
});

/*로그인 성공시 사용자 정보를 Session에 저장한다*/
passport.serializeUser(function (user, done) {
  //console.log('passport session save : ', user.id);
  done(null, user)
});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/*로그인 유저 판단 로직
* 로그인한 유저       -> req.isAuthenticated()에서 true를 반환한 후 next()호출해서 다음 작업 진행
*                    -> 이외에도 isAuthenticated()는 /profile에 접속 가능 여부를 판단하는데에도 쓰임
* 로그인하지 않은 유저 -> 첫 페이지로 리다이렉트*/
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
};


passport.use('local-login',new LocalStrategy({
  usernameField: 'id', // usernameField랑 passwordField는 login.ejs name이랑 동일해야 함
  passwordField: 'password',
  passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
}, function (req, id, password, done) {
  mysqlDB.query('select * from Admin where id = ?', id, function (err, result) {
    if (err) {
      console.log('err :' + err);
      return done(false, null);//인증 실패
    } else {
      if (result.length === 0) {
        console.log('해당 유저가 없습니다');
        return done(false, null);//인증 실패
      } else {
        if (password !== result[0].password) {
          console.log('패스워드가 일치하지 않습니다');
          return done(false, null);//인증 실패
        } else {
          console.log('로그인 성공');
          console.log(result[0].id);
          console.log(result[0].school);
          return done(null, {
            id: result[0].id,
            name: result[0].school
          });
        }
      }
    }
  })
}));


/*router.get('/', function (req, res, next) {
  console.log(req.user);
  res.render('index', {
    title: 'express'
  });
});*/


router.get('/login', function (req, res) {

  console.log(req.user);

  if(req.user !== undefined){ //이미 로그인한 유저인 경우 홈으로
    res.redirect('/');
  }
  else{// 모르는 유저면 로그인 화면 띄우기
    //res.render('login');
    res.redirect('/');
  }

});


/*index.ejs에서 post를 받으면 passport.authenticate를 local strategy로 호출
* failureRedirect를 통해서 로그인 실패시 어디로 리다이렉트 할지 설정,
* 만약 로그인을 성공하면 csv 으로 리다이렉트*/
router.post('/login', passport.authenticate('local-login', {
      failureRedirect: '/', failureFlash: true}), // 인증실패시 401 리턴, {} -> 인증 스트레티지
    function (req, res) {
      res.redirect('/csv');
    });

router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', [], function(err, user, info) {
    if(err) {return next(err);}

    return next();
  })(req, res, next);
});


router.get('/register', function (req, res) {
  if(req.user !== undefined){//이미 로그인한 유저는 홈으로 가도록한다.
    res.redirect('/')
  }else {
    res.render('register', {
      title: 'register'
    })
  }
});


router.post('/register', function(req, res, next) {

  mysqlDB.query('select * from Admin where id=?', req.body.id, function (err, rows) {
    if (err) {
      console.log("get username from 회원가입 failed");
      res.json({
        "code" : 204,
        "result" : "회원가입 failed"
      }); }

    if (rows.length) {//존재하는 아이디인 경우
      res.json({
        "code" : 204,
        "result" : "this ID is already used"
      });
    }
    else {//새로운 아이디인 경우
      var sql = 'insert into Admin(id, password, school, admin_is_auth) values (?,?,?,1)';
      mysqlDB.query(sql, [req.body.id,  req.body.password, req.body.school], function(error, result) {
        if(error) {
          console.log(error);
        }
        else{ //회원가입 성공
          console.log("회원가입 성공");
          res.json({
            "code" : 200,
            "result" : result
          });
        }
      })

    }
  })
});



/*Log out*/
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


router.get('/profile', isAuthenticated, function (req, res) {
  res.render('profile', {
    title: 'My Info',
    user_info: req.user

  })
});



module.exports = router;
