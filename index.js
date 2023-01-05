const express = require('express');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');

dotenv.config();
const app = express();
const port = 3000;

// default option
app.use(fileUpload());

// Static Files
app.use(express.static('public'));
app.use(express.static('upload'));

// Templating engine
app.engine('hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

pool.getConnection((err, connection) => {
  if (err) throw err; // not connected
  console.log('Connected!');
});

app.get('', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log('Connected!');

    connection.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {
      // Once done, release connection
      connection.release();
      if (!err) {
        res.render('index', { rows });
      }
    });

  });
});

app.post('', (req, res) => {
  let sampleFile;
  let uploadPath;
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  // name of the input is sampleFile
  sampleFile = req.files.sampleFile;
  let fileName = Date.now() + sampleFile.name;
  uploadPath = __dirname + '/upload/' + fileName;

  // Use mv() to place file on the server
  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log('Connected!');

      connection.query('UPDATE user SET profile_image = ? WHERE id ="1"', [fileName], (err, rows) => {
        // Once done, release connection
        connection.release();

        if (!err) {
          res.redirect('/');
        } else {
          console.log(err);
        }

      });
    });

    // res.send('File uploaded!');
  });
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));