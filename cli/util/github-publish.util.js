var request = require('request')
var async = require('async')
const mime = require('mime-types');
var progress = require('progress-stream')
var util = require('util')
var fs = require('fs')
var path = require('path')
var pkg = require('../package.json')
var EventEmitter = require('events').EventEmitter
var rp = require('request-promise');
const chalk = require('chalk');

var GITHUB_API_ROOT = 'https://api.github.com'

function GithubPublishUtil (opts, cb) {
    if (!(this instanceof GithubPublishUtil)) return new GithubPublishUtil(opts, cb)
    this.opts = (opts || {})
    this.cb = (cb || function noop () {})
}

util.inherits(GithubPublishUtil, EventEmitter);

GithubPublishUtil.prototype.publish = function publish () {
    var self = this
    var opts = this.opts
    var cb = this.cb

  
    if (opts.assets && opts.assets.length > 0) {
      try {
        opts.assets.forEach(function (f) {
          fs.accessSync(path.resolve(f))
        })
      } catch (err) {
        cb(new Error('missing asset ' + err.path))
      }
    }
  
    async.auto(
        {
     
            createRelease: function (callback) {
                var ghReleaseUri = util.format((opts.apiUrl || GITHUB_API_ROOT) + '/repos/%s/%s/releases', opts.owner, opts.repo)
        
                function requestCreateRelease () {
                    self.emit('init-create-release')
                    var reqDetails = {
                        uri: ghReleaseUri,
                        method: 'POST',
                        json: true,
                        body: {
                            tag_name: opts.tag,
                            target_commitish: opts.target,
                            name: opts.name,
                            body: opts.notes,
                            draft: !!opts.draft,
                            prerelease: !!opts.prerelease
                        },
                        headers: {
                        'Authorization': 'token ' + opts.token,
                        'user-agent': 'ngxeu ' + pkg.version             
                        }
                    }
                    request(reqDetails, function (err, res, body) {
                        if (err) {
                            return callback(err)
                        }
                        var errorStatus = res.statusCode >= 400 && res.statusCode < 600
                        if (errorStatus) {
                            var e = new Error('Error status: ' + res.statusCode + '  response body:' + JSON.stringify(body) + '\n request details:' + JSON.stringify(reqDetails, null, 2))
                            return callback(e)
                        }
                        self.emit('created-release')
                        callback(null, body)
                    })
                }
        
                if (opts.reuseRelease) {
                    request({
                        uri: ghReleaseUri,
                        method: 'GET',
                        json: true,
                        headers: {
                        'Authorization': 'token ' + opts.token,
                        'user-agent': 'ngxeu ' + pkg.version  
                        }
                    }, function (err, res, body) {
                        if (err) return callback(err)
            
                        var bodyReturn = null
            
                        async.eachSeries(body, function (el, callback) {
                            if (el.tag_name === opts.tag) {
                                bodyReturn = el
                                return
                            }
                            callback()
                        })
                
                        var statusOk = res.statusCode >= 200 && res.statusCode < 300
                        var hasReleaseMatchingTag = bodyReturn && bodyReturn.tag_name === opts.tag
                        var canReuse = !opts.reuseDraftOnly || (bodyReturn && bodyReturn.draft)
            
                        if (statusOk && hasReleaseMatchingTag && canReuse) {
                            self.emit('reuse-release')
                            bodyReturn.allowReuse = true
                            callback(null, bodyReturn)
                        } 
                        else if (!hasReleaseMatchingTag || hasReleaseMatchingTag && !opts.skipIfPublished) {
                            requestCreateRelease();
                        }
                    })
                } else {
                    requestCreateRelease();
                }
            },
        
            uploadAssets: ['createRelease', function (results, callback) {
        if (!opts.assets || opts.assets.length === 0) return callback()
        if (results.createRelease.errors || !results.createRelease.upload_url) return callback(results.createRelease)
        let fileNameBarSpaceObject = calculateCliBarSize(opts.assets);
        console.log("\n");
        function calculateCliBarSize(assets) {
            let fileNameBarSpaceObject = {};
            let maxSize = 0;
            assets.forEach(asset=>{
                var fileName = path.basename(asset);
                var blockSize = fileName.length;
                if(maxSize<blockSize){
                    maxSize = blockSize;
                }
            })
            assets.forEach(asset=>{
                var fileName = path.basename(asset);
                var blockSize = fileName.length;
                let barSpace = maxSize - blockSize;
                fileNameBarSpaceObject[fileName] = barSpace;
            })
            return fileNameBarSpaceObject;
        }

        async.each(opts.assets, function (asset, callback) {
          var fileName = path.basename(asset)
          var uploadUri = results.createRelease.upload_url.split('{')[0] + '?name=' + fileName
  
          requestUploadAsset();
  
          function requestUploadAsset () {
            self.emit('upload-asset', fileName)
  
            var stat = fs.statSync(asset)
            self.emit('asset-info', fileName,fileNameBarSpaceObject[fileName],stat.size);
            var rd = fs.createReadStream(asset)
            var us = request({
              method: 'POST',
              uri: uploadUri,
              headers: {
                'Authorization': 'token ' + opts.token,
                'Content-Type': mime.lookup(fileName) || 'application/octet-stream',
                'Content-Length': stat.size,
                'user-agent': 'ngxeu ' + pkg.version  
              }
            }, function (err, res, body) {
              if (err) return callback(err)
  
              const bodyJson = JSON.parse(body)
              if (res.statusCode === 422 && bodyJson.errors && bodyJson.errors[0].code === 'already_exists') {
                self.emit('duplicated-asset', fileName)
                callback();
              } else {
                self.emit('uploaded-asset', fileName)
                callback();
              }
            })
  
            var prog = progress({
                length: stat.size,
                time: 100
            }, function (p) {            
              self.emit('upload-progress', fileName, p)
            })
  
            rd.on('error', function (err) {
              return callback(err)
            })
  
            rd.pipe(prog).pipe(us)
          }
        }, function (err) {
          return callback(err)
        })
    }] 
    
        }, 
        function (err, results) {
                if (err) {
                    self.emit('error', err)
                    return cb()
                }
                cb(null, results.createRelease)
        }
    )
}

GithubPublishUtil.prototype.deleteReleaseOrTag = async function deleteReleaseOrTag(id,opts){
    var deleteTagUri;
    var self = this;
    if(opts.emptyTags){
        deleteTagUri = util.format((opts.apiUrl || GITHUB_API_ROOT) + '/repos/%s/%s/git/refs/tags/%s', opts.owner, opts.repo, id)
    }
    else{
        deleteTagUri = util.format((opts.apiUrl || GITHUB_API_ROOT) + '/repos/%s/%s/releases/%s', opts.owner, opts.repo, id);
    }
    const requestOptions  = {
        method:'DELETE',
        uri:deleteTagUri,
        headers: {
        'Authorization': 'token ' + opts.token,
        'user-agent': 'ngxeu ' + pkg.version  
        },
        json: true ,
        resolveWithFullResponse: true 
        
    }     
    await rp(requestOptions)
        .then(function (response) {
            self.emit('tag-deleted',opts.tag,response);
            let targetInfo = '';
            let targetInfoPrefix = ''
            if(opts.target){
                targetInfoPrefix = ' from';
                targetInfo = ' '+opts.target;
            }
            let tag = opts.tag;
            if(!opts.tag){
                tag = id;
            }
            console.log(chalk.green("\nSuccess(")+chalk.cyan(response.statusCode)+chalk.green("): Tag ")+chalk.cyan(tag)+chalk.green(' deleted'+targetInfoPrefix)+chalk.cyan(targetInfo)+chalk.green(" successfully!!"));
        })
        .catch(function (err) {
            self.emit('tag-delete-error',opts.tag,err);
            console.log(chalk.red('\nError('+chalk.cyan(err.statusCode)+'): ')+chalk.red(err.error.message+' for tag ')+chalk.cyan(id));
        });
}
  
module.exports = GithubPublishUtil