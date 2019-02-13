let fs = require('fs');        
let path = require('path');
let unzipper = require('unzipper');
var util = require('util');
var EventEmitter = require('events').EventEmitter

function NgxElectronInstaller () {
    if (!(this instanceof NgxElectronInstaller)) return new NgxElectronInstaller()
}

util.inherits(NgxElectronInstaller, EventEmitter);

NgxElectronInstaller.prototype.setOptions = function(opts) {
    this.opts = opts;
}
NgxElectronInstaller.prototype.extract = function() {
    var opts = this.opts
    _extract(opts,this);
}
NgxElectronInstaller.prototype.archiveInfo = function() {
  let ZIP_FILE_PATH = this.opts.zip_file_path;
  const directory = await unzipper.Open.file(ZIP_FILE_PATH);
  this.emit('directory', directory);
}

function _extract(options,installer){

    let ZIP_FILE_PATH =options.zip_file_path;
    let currentDir = options.app_dir;
    let resourcePath;
    let extractPath = options.extract_path||currentDir + "/update" ;
    if(options.os==='win'){
      resourcePath = 'resources/app/';
    }
    let entryCounter = 0;
    fs.createReadStream(ZIP_FILE_PATH)
            .pipe(unzipper.Parse())
            .on("entry", (entry) =>{
              var fileName = entry.path;
              var type = entry.type; // 'Directory' or 'File'
              var totalSize = entry.size;
              if (fileName.indexOf(resourcePath+"build/") > -1) {
                fileName = fileName.replace(resourcePath, "");
                if (type == "Directory") {
                  forceCreateDir(extractPath + '/' + fileName);
                } else if (type == "File") {
                  var fstream =  fs.createWriteStream(extractPath + '/' + fileName);
                  entry.pipe(fstream);
                }
              } else {
                entry.autodrain();
              }
              entryCounter++;
            })
  }

function forceCreateDir(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (err.code==="ENOENT") {
        forceCreateDir(path.dirname(dir)); //create parent dir
        forceCreateDir(dir); //create dir
      }
    }
  }

module.exports = NgxElectronInstaller()