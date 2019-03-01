let fs = require('fs');        
let path = require('path');
let unzipper = require('unzipper');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
let http = require("follow-redirects").http;
let https = require('follow-redirects').https;

function NgxElectronUpdaterUtil () {
    if (!(this instanceof NgxElectronUpdaterUtil)) return new NgxElectronUpdaterUtil()
}

util.inherits(NgxElectronUpdaterUtil, EventEmitter);

NgxElectronUpdaterUtil.prototype.setOptions = function(opts){
    this.opts = opts;
}
NgxElectronUpdaterUtil.prototype.extract = function() {
    var opts = this.opts
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
  let resourcePath;
  let buildPath='/app/build';
  let appPath="/app";
  let lookupPath;
  let replacePath;
  let extractPath = options.extract_path||currentDir + "/ngxeu/update" ;
  if(options.os==='win'){
    resourcePath = 'resources';
  }
  if(options.updateType==='build'){
    replacePath=resourcePath+appPath;
    lookupPath= resourcePath+buildPath;
  }
  else{
    replacePath=resourcePath;
    lookupPath= resourcePath+appPath;
  }

  fs.createReadStream(ZIP_FILE_PATH)
    .pipe(unzipper.Parse())
    .on("entry", (entry) =>{
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
    }
  ).on('finish',()=>{
    installer.emit('finish');
  });
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