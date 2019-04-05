let fs = require('fs');        
let path = require('path');
let unzipper = require('unzipper');
var util = require('util');
var eventEmitter = require('events').EventEmitter;
let http = require("follow-redirects").http;
let https = require('follow-redirects').https;
var semver = require('semver');
var AdmZip = require('adm-zip');
function NgxElectronUpdaterUtil () {
    if (!(this instanceof NgxElectronUpdaterUtil)) return new NgxElectronUpdaterUtil()
}

util.inherits(NgxElectronUpdaterUtil, eventEmitter);

NgxElectronUpdaterUtil.prototype.gt = function(v1,v2){
  return semver.gt(v1,v2);
}

NgxElectronUpdaterUtil.prototype.gte = function(v1,v2){
  return semver.gte(v1,v2);
}

NgxElectronUpdaterUtil.prototype.lt = function(v1,v2){
  return semver.lt(v1,v2);
}

NgxElectronUpdaterUtil.prototype.lte = function(v1,v2){
  return semver.lte(v1,v2);
}

NgxElectronUpdaterUtil.prototype.eq = function(v1,v2){
  return semver.eq(v1,v2);
}

NgxElectronUpdaterUtil.prototype.neq = function(v1,v2){
  return semver.neq(v1,v2);
}


NgxElectronUpdaterUtil.prototype.setOptions = function(opts){
    this.opts = opts;
}
NgxElectronUpdaterUtil.prototype.extract = function() {
  console.log("extraction begining");
    var opts = this.opts
    console.log(opts);
    _extract(opts,this);
    console.log("extraction done");
}
NgxElectronUpdaterUtil.prototype.archiveInfo = function() {
  let ZIP_FILE_PATH = this.opts.zip_file_path;
  return unzipper.Open.file(ZIP_FILE_PATH);
}

NgxElectronUpdaterUtil.prototype.createPathIfNotExist = function(directoryPath) {
  _forceCreateDir(directoryPath);
}

NgxElectronUpdaterUtil.prototype.download = function(url, downloadPath,fileName) {
  _download(url, downloadPath,fileName,this);
}


function _extract(options,installer){ 
  let ZIP_FILE_PATH =options.zip_file_path;
  let currentDir = options.app_dir;
  let appName = options.appName;
  let resourcePath;
  let buildPath='/app/build';
  let appPath="/app";
  let lookupPath;
  let replacePath;
  let extractPath = options.extract_path||currentDir + "/ngxeu/update" ;
  if(options.os==='win'){
    resourcePath = 'resources';
  }
  else if(options.os==='mac'){
    resourcePath = 'resources';
    if(options.updateType==='app'){
      resourcePath=appName+'.app/Contents/Resources';
    }
  }
  if(options.updateType==='build'){
    replacePath=resourcePath+appPath;
    lookupPath= resourcePath+buildPath;
  }
  else{
    replacePath=resourcePath;
    lookupPath= resourcePath+appPath;
  }
  let zipEntryCounter = 0;
  if(options.os==='win'){
    var zip = new AdmZip(ZIP_FILE_PATH);
    var zipEntries = zip.getEntries(); 
    zipEntryCounter = zipEntries.length;
  }

  let entryCounter = 0;
  fs.createReadStream(ZIP_FILE_PATH)
    .pipe(unzipper.Parse())
    .on("entry", (entry) =>{
      entryCounter++;
      var fileName = entry.path;
      var type = entry.type; // 'Directory' or 'File'
      if (fileName.indexOf(lookupPath) > -1) {
        installer.emit('extracting',fileName);
        fileName = fileName.replace(replacePath, "");
        if (type == "Directory") {
          _forceCreateDir(extractPath + '/' + fileName);
        } else if (type == "File") {
          var fstream =  fs.createWriteStream(extractPath + '/' + fileName);
          entry.pipe(fstream);
        }
      } else {
        entry.autodrain();
      }
      if(options.os==='win'){
        if(entryCounter===zipEntryCounter){
          installer.emit('finish');
        }
      }
    }
  )
  .on('finish',()=>{
    if(options.os!='win'){
      installer.emit('finish');
    }
  });

  setTimeout(()=>{
    //finish forcefully after 15 secs for mac temp fix
    //permanent fix can be thought in future
    if(options.os==='mac'){
      installer.emit('finish');
    }
  },15000);
}

function _forceCreateDir(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (err.code==="ENOENT") {
        _forceCreateDir(path.dirname(dir)); //create parent dir
        _forceCreateDir(dir); //create dir
      }
    }
}

function _getWebProtocol(url){
  if (url.indexOf("http://") == 0 ) {
      return "http"
  }
  else if(url.indexOf("https://") == 0){
      return "https"
  }
}

function _download(url, downloadPath,fileName,installer) {
  let httpClient;
  if(_getWebProtocol(url)=="http"){
      httpClient = http;
  }
  else if(_getWebProtocol(url)=="https"){
      httpClient = https;
  }
  _forceCreateDir(downloadPath);
  var outStream = fs.createWriteStream(downloadPath+"/"+fileName);
  var request = httpClient.get(url, (response) => {
      var len = parseInt(response.headers['content-length'], 10);
      var cur = 0;
      var total = len / 1048576; //1048576 - bytes in  1Megabyte

      response.on("data", (chunk)=> {
          cur += chunk.length;
          var currentPercentage = (100.0 * cur / len).toFixed(2);
          var totalPercentage = total.toFixed(2);
          var downloadSpeedMbps = (cur / 1048576).toFixed(2);
          let downloadStatus = {};
          downloadStatus.currentPercentage = currentPercentage;
          downloadStatus.totalPercentage = totalPercentage;
          downloadStatus.speed = downloadSpeedMbps; 
          installer.emit('data',downloadStatus);
          if(currentPercentage==='100.00'){
            installer.emit('finish');
          }
      });

      request.on("error", function(e){
        let downloadStatus = {};
        downloadStatus.errorMessage = e.message;
        installer.emit('error',downloadStatus);
      });

      response.pipe(outStream);
  });
}

module.exports = NgxElectronUpdaterUtil()