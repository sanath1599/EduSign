const express = require('express');
const bodyParser = require('body-parser');
var multer  = require('multer')
const path = require('path');
var app = express();
var sha256File = require('sha256-file');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
app.set('port', PORT);
app.set('env', NODE_ENV);
var upload = multer({ dest: 'uploads/' })


app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post('/', upload.single('file'), function (req, res, next) {
file = req.file
res.send(file)
console.log(file)
sha256File('./uploads/'+req.file.filename, function (error, sum) {
  if (error) return console.log(error);
  console.log(sum)
  
})

})


app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});
