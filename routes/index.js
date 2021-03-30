var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('bootEX', {
    title: 'MUSE'
  });
});

// test
module.exports = router;
