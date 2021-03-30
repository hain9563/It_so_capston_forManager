var express = require('express');
var router = express.Router();
const fs = require('fs');
const csv = require('fast-csv');
var formidable = require('formidable');
var upload_path = __dirname + '../../csvFile/';
var mysqlDB = require('../config/mysql-db');
let newpath = "";
var users = require('./users');
/*const createCsvWriter = require('csv-writer').createObjectCsvWriter();
const csvWriter = createCsvWriter({

})*/


//  /csv
router.get('/', function (req, res) {
    res.render('main', {
        title: '과목추가',
        user_info: req.user
    });
});

router.get('/csv_major', function (req, res) {
    res.render('csv_major',{
        user_info: req.user
    });
});

router.get('/csv_nonmajor', function (req, res) {
    res.render('csv_nonmajor');
});

router.get('/csv_openMajor', function (req, res) {
    res.render('csv_openMajor',{
        user_info: req.user
    });
});

router.get('/csv_openNonmajor', function (req, res) {
    res.render('csv_openNonmajor');
});

/*router.get('/main_graduation', function (req, res) {
    res.render('graduation');
});*/

//  /csv/upload
router.post('/upload', function (req, res) {
    //console.log(files.filetoupload.name);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // oldpath : temporary folder to which file is saved to
        var oldpath = files.filetoupload.path;
        newpath = upload_path + files.filetoupload.name;
        console.log(files.filetoupload.name);
        console.log(newpath);
        // copy the file to a new location
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            // you may respond with another html page
            res.write('File uploaded and moved!');
        });
        console.log(newpath);
    });


});


/* 관리자가 전공과목을 추가할 때 필요한 api, majorsubject에 db 추가
 */

router.post('/majorsubject', function (req, response) {
    let stream = fs.createReadStream(newpath);
    let myArray = [];
    let csvStream = csv
        .parse()

        .on("data", (data) => {
            myArray.push(data);
        })
        .on("end", function () {
            myArray.shift();
            let query = 'INSERT INTO majorsubject (school, major, subject_name, required, semester, credit) VALUES ?';
            mysqlDB.query(query, [myArray], (error, result) => {
                if(error){
                    console.log(error);
                } else {
                    response.redirect('/csv');
                }
            })
        });
    //res.write("잘 반영되었습니다.");

    stream.pipe(csvStream);
    //res.render('index');
});


/* 관리자가 전공과목을 추가할 때 필요한 api, nonmajorsubject db 추가
 */

router.post('/nonMajorSubject', function (res, req) {

    let stream = fs.createReadStream(newpath);
    let myArray = [];
    let csvStream = csv
        .parse()

        .on("data", (data) => {
            myArray.push(data);
        })
        .on("end", function () {
            myArray.shift();
            let query = 'INSERT INTO nonmajorsubject (school, id, subject_name, credit) VALUES ?';
            mysqlDB.query(query, [myArray], (error, result) => {
                if(error){
                    console.log(error);
                } else {
                    console.log(result);
                }
            })
        });


    stream.pipe(csvStream);
});


/* 관리자가 전공과목을 추가할 때 필요한 api, open_major db 추가
 */

router.post('/openMajor', function (req, response) {

    let stream = fs.createReadStream(newpath);
    let myArray = [];
    let csvStream = csv
        .parse()

        .on("data", (data) => {
            myArray.push(data);
        })
        .on("end", function () {
            myArray.shift();
            let query = 'INSERT INTO Open_major_ (school, major, subject_name, required, credit, time) VALUES ?';
            mysqlDB.query(query, [myArray], (error, result) => {
                if(error){
                    console.log(error);
                } else {
                    response.redirect('/csv');
                }
            })
        });


    stream.pipe(csvStream);
});


/* 관리자가 전공과목을 추가할 때 필요한 api, majorsubject에 db 추가
 */

router.post('/openNonmajor', function (res, req) {

    let stream = fs.createReadStream(newpath);
    let myArray = [];
    let csvStream = csv
        .parse()

        .on("data", (data) => {
            myArray.push(data);
        })
        .on("end", function () {
            myArray.shift();
            let query = 'INSERT INTO Open_nonmajor (school,subject_name, time) VALUES ?';
            mysqlDB.query(query, [myArray], (error, result) => {
                if(error){
                    console.log(error);
                } else {
                    console.log(result);
                }
            })
        });


    stream.pipe(csvStream);
});


/* 졸업요건 조회
 */
router.get('/graduation', function (req, res) {
    /* 졸업요건 조회 */
    var school = req.user.name;
    //console.log(school);
    //var school = "\'아주대학교\' ;";
    let query = 'select * from Graduation_requirement where school = ?';
    mysqlDB.query(query, school, (error, result) => {
        if(error){
            console.log(error);
        } else {
            //console.log(result);
            res.render('graduation',{
                data: result,
                user_info : req.user
            });
        }
    })
});



router.post('/graduation', function (res, req) {

    /* 졸업요건 수정 */
    var school = req.body.school;
    var major = req.body.major;
    var admission_num = req.body.admission_num;
    var required_credit = req.body.required_credit;
    var required_credit_major = req.body.required_credit_major;
    var required_credit_non_major = req.body.required_credit_non_major;
    //console.log(required_credit);
    var query = 'insert into Graduation_requirement (school, major, admission_num, required_credit, required_credit_major, required_credit_non_major)' +
        ' values (?,?,?,?,?,?)';

    mysqlDB.connect(query, [school, major, admission_num, required_credit, required_credit_major, required_credit_non_major], function(err, result){
        if(err){
            console.log(err);
        } else {
            console.log(result);
        }
    });

});


module.exports = router;
