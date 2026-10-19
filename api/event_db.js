const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'wxu23_wxu23',
    password: 'Xwx20050824.',
    database: 'wxu23_charityevents_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database. Thread ID: ' + db.threadId);
});

module.exports = db;