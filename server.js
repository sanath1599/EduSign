const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer')
const path = require('path');
const fs = require('fs');
var rn = require('random-number');
var sleep = require('system-sleep');
var md5 = require('md5');
//app.use(session({secret:'XASDASDA'}));
var ssn ;
var app = express();
var sha256File = require('sha256-file');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
app.set('port', PORT);
app.set('env', NODE_ENV);
var upload = multer({ dest: 'uploads/' })


app.post('/register', function (req, res){


    pass=req.param('password')

  registerUser(req.param('first_name'),req.param('last_name'),req.param('email'),req.param('organization'),pass)
  console.log("Registered Succesfully")

    });

app.post('/login', function (req, res){
  element = db.get('user')
  .find({ "pass": req.params.password })
  .value()
  console.log(element)
  if(element){
    res.redirect('http://localhost:8080/profile.html');
  }
});

app.post('/upload', upload.single('file'), function (req, res, next) {
  // ssn=req.session;
  // organization=ssn.organization;
  var now = new Date();
  var pass = req.param('pass');
  var jsonDate = now.toJSON();
  var organization="coding.Studio();"
  file = req.file
  //res.send(file)
  console.log(file)
  sha256File('./uploads/'+req.file.filename, function (error, sum) {
    if (error) return console.log(error);
    console.log(sum)
  storeDB(req.file.originalname,req.file.filename,sum)
  file_success=generateDB(req.file.originalname,req.file.filename,sum,organization,jsonDate,pass)
  file_no =rn(0000,9999)
  fs.writeFileSync(file_no+'.json',file_success)
  res.sendFile(__dirname+'/'+file_no+'.json')
  sleep(500)
  fs.unlink(__dirname+'/'+file_no+'.json', function (err) {
  if (err) throw err;
  // if no error, file has been deleted successfully
  console.log('File deleted!');
});
})

})

app.post('/fetch', upload.single('file'), function (req, res, next) {

  file = req.file
  const obj = JSON.parse(file);
  new_file=obj.new_name
  new_file=findFile(new_file)
  res.sendFile(new_file)
})
app.post('/verify', upload.single('file'), function (req, res, next) {
file = req.file
sha256File('./uploads/'+req.file.filename, function (error, sum) {
  if (error) return console.log(error);
  console.log(sum)
  if(verifyFile(sum)==1){
    res.send('File Not Modified')
    console.log("Not modified")
}
  else{
    console.log("file doesn't exist/modified")
    res.send('File Modified')
  }
  fs.unlink(req.file.path, function (err) {
  if (err) throw err;
  // if no error, file has been deleted successfully
  console.log('File deleted!');
});
  //if sum exists then return verified
})

})
//Store the new and original name of the file in the DB along with the SUM
function storeDB(orig_name,new_name,sha_value){
  db.get('key')
  .push({ orig: orig_name, new: new_name, sha:sha_value})
  .write()
  db.update('count', n => n + 1)
  .write()
}

function registerUser(first_name,last_name,email,org,password){
  db.get('user')
  .push({ "first_name": first_name, "last_name": last_name, "email":email, "organization": org, "pass":password})
  .write()
}

function generateDB(orig,new_name,sum,org,date,pass){
  hash = md5(pass)
  //generate a DB
  let key = {
    orig_name: orig,
    new_name: new_name,
    hash: sum,
    organization: org,
    Date: date,
    pass: hash
};

let data = JSON.stringify(key, null, 4);

return data
}
//Find element function for verifiction
function findFile(new_file){

  result_url = __dirname + "/uploads/" + new_file
  return result_url
}
// function sessionSet(){
//   var ses = db.get('user')
//   .find({sha:sanath})
//   .value()
//   ssn.name=ses.name
//   ssn.organization=ses.organization
// }
function verifyFile(sha_value){
  element = db.get('key')
  .find({ sha: sha_value })
  .value()
  console.log(element)
  if(element){
    return true;
  }
}

app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});
