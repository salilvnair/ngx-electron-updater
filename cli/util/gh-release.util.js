const chalk = require('chalk');
const Octokit = require('@octokit/rest');
var log = require('single-line-log').stdout;
const GithubPublishUtil = require('../util/github-publish.util');
const crypto = require('crypto');
const algorithm = 'aes-128-cbc';
module.exports = {
    listRelease: async(ghToken,owner, repo, listCmd) => {
        try {
            const octokit = initializeGHToken(ghToken);
            console.log(`${chalk.green('\nlisting '+listCmd+' releases where')}: owner=${chalk.cyan(owner)}, repo=${chalk.cyan(repo)}`);
            if(listCmd==='latest') {
                const res = await octokit.repos.getLatestRelease({
                    owner: owner,
                    repo: repo
                });
                return res.data; 
            }
            const res = await octokit.repos.listReleases({
                owner: owner,
                repo: repo
            });
            return res.data;
        } catch (err) {
            console.error(chalk.red("Error:"),err);
        }
    },

    uploadAsset:(ghToken,owner, repo,name, tag, target, notes, files, draft,prerelease) => {
        let options = {};
        options.tag = tag;
        options.owner = owner;
        options.repo = repo;
        options.draft = draft;
        options.target=target||'master';
        options.name = name || tag;
        options.assets = files;
        options.token = ghToken;
        options.notes = notes||'';
        options.prerelease = prerelease;
        let githubPublishUtil = GithubPublishUtil(options,function(err, release){
            if (err) throw err
            var newLineToken = "";
            files.forEach(element => {
                newLineToken = newLineToken+"\n";
            });
            console.log(newLineToken+'Successfully published at: ' + chalk.cyan(release.html_url))
            process.exit(0);
        });
        githubPublishUtil.publish();
        githubPublishUtil.on('asset-info', function (name,barSpace,size) {
            createBars(name,barSpace,size);
        });
        githubPublishUtil.on('upload-progress', (name, progress)=>{            
            notifyMultipleProgress(name, progress);
        });
        githubPublishUtil.on('uploaded-asset', function () {
            log.clear();
        });

    },

    deleteReleaseByTag:async(ghToken,owner, repo,tag,releaseIds,emptyTags,target) => {
        let options = {};
        options.owner = owner;
        options.tag = tag;
        options.repo = repo;
        options.token = ghToken;
        options.emptyTags = emptyTags;
        options.target=target;
        let githubPublishUtil = GithubPublishUtil(options);
        if(emptyTags){
            for(i=0;i<emptyTags.length;i++){
                await githubPublishUtil.deleteReleaseOrTag(emptyTags[i],options);
            }
        }
        else{
            for(i=0;i<releaseIds.length;i++){
                await githubPublishUtil.deleteReleaseOrTag(releaseIds[i],options);
            }
        }
    },

    encryptToken: (owner, repo, value) => {
        return _encrypt(value, owner+repo);
    },

    decryptToken: (owner, repo, value) => {
        return _decrypt(value, owner+repo);
    }

    
};

var multiprog = require("./progressbar.util");
var multi = new multiprog(process.stderr);
var nameBarSet = [];

function createBars(name,barSpace,size){
    let space = " ";
    space = space.repeat(barSpace+5);
    var bar = multi.newBar(chalk.green(' uploading '+name+space)+' [:bar] :percent :etas', {
        complete: chalk.cyan('░'),
        incomplete: chalk.cyan('.'),
        width: 30,
        total: 100
        });
    var nameBar = {'name':name,'bar':bar};
    nameBarSet.push(nameBar);
}    

function notifyMultipleProgress(name, progress) {
    var pct = progress.percentage;
    var nextTick = Math.floor(pct);
    var nameBar = nameBarSet.find(nameBarItr=>nameBarItr.name===name);
    nameBar.bar.update(nextTick/100);
}

function initializeGHToken(ghToken) {
    return new Octokit({
        auth: 'token '+ghToken
      });
}

function _encrypt(value,salt) {
    if (value == null) {
        throw new Error('value must not be null or undefined');
    }

    const hash = crypto.createHash("sha1");
    hash.update(salt);
    let key = hash.digest().slice(0, 16);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(String(value), 'utf8', 'hex') + cipher.final('hex');

    return iv.toString('hex') + encrypted;
}

function _decrypt(value,salt) {
    if (value == null) {
        throw new Error('value must not be null or undefined');
    }

    const stringValue = String(value);
    const iv = Buffer.from(stringValue.slice(0, 32), 'hex');
    const encrypted = stringValue.slice(32);
    const hash = crypto.createHash("sha1");
    hash.update(salt);
    let key = hash.digest().slice(0, 16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

