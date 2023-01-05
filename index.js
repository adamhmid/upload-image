const express = require("express");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const exphbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const mysql = require("mysql");

dotenv.config();
const app = express();
const port = 3000;

// default option
app.use(fileUpload());

// Static Files
app.use(express.static("public"));
app.use(express.static("upload"));

// Templating engine
app.engine("hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", "hbs");

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

pool.getConnection((err, connection) => {
  if (err) throw err; // not connected
  console.log("Connected!");
});

app.get("", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log("Connected!");

    connection.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {
      // Once done, release connection
      connection.release();
      if (!err) {
        res.render("index", { rows });
      }
    });
  });
});

cloudinary.config({
  cloud_name: "ddwwbifgg",
  api_key: "926681871762698",
  api_secret: "RP046eeEZoFf7kBH6jk777vsiFw",
});

app.post("", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  // name of the input is sampleFile
  let file = req.files.sampleFile;
  let fileName = Date.now() + file.name;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    public_id: Date.now(),
    resource_type: "auto",
    folder: "images"
  })

  // Use mv() to place file on the server
  if (err) return res.status(500).send(err);

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log("Connected!");

    connection.query(
      'UPDATE user SET profile_image = ? WHERE id ="1"',
      [result.url],
      (err, rows) => {
        // Once done, release connection
        connection.release();

        if (!err) {
          res.redirect("/");
        } else {
          console.log(err);
        }
      }
    );
  });
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
