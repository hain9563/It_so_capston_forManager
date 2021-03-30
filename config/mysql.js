var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '106.10.58.65',
    user: 'root',
    password: 'Test!@#123',
    port: 18081,
    database: 'muse',
    multipleStatements: true
});

connection.connect();

connection.query('SELECT * from USER', function (err, rows, fields) {
    if (!err)
        console.log('User: ', rows);
    else
        console.log('Error while performing Query.', err);

    connection.end();
});
