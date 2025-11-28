const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'my-mysql.mysql.svc.cluster.local',
  user: '2401202_swarsetu',
  password: 'swarsetu@aaryatilak',
  database: 'swarsetu1'
});

const schema = fs.readFileSync('schema.sql', 'utf8');

connection.query(schema, err => {
  if (err) throw err;
  console.log("Tables created successfully");
  connection.end();
});
