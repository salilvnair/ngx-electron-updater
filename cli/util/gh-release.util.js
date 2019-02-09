const chalk = require('chalk');
const Octokit = require('@octokit/rest');
const octokit = new Octokit();
var util = require('util')
var log = require('single-line-log').stdout;
var pkg = require('../package.json')
const GithubPublishUtil = require('../util/github-publish.util');
var rp = require('request-promise');
var GITHUB_API_ROOT = 'https://api.github.com';
module.exports = {
    listRelease: async(ghToken,owner, repo, listCmd) => {
        try {
            validateGHToken(ghToken);
            console.log(`${chalk.green('listing '+listCmd+' release where')}: owner=${chalk.cyan(owner)}, repo=${chalk.cyan(repo)}`);
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

    uploadAsset:(ghToken,owner, repo,name, tag, target, notes, files, draft) => {
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
        options.prerelease = false;
        let githubPublishUtil = GithubPublishUtil(options,function(err, release){
            if (err) throw err
            var newLineToken = "";
            files.forEach(element => {
                newLineToken = newLineToken+"\n";
            });
            console.log(newLineToken+'Successfully published at: ' + release.html_url)
            process.exit(0);
        });
        githubPublishUtil.publish();
        githubPublishUtil.on('asset-info', function (name,size) {
            createBars(name,size);
        });
        githubPublishUtil.on('upload-progress', (name, progress)=>{            
            notifyMultipleProgress(name, progress);
        });
        githubPublishUtil.on('uploaded-asset', function () {
            log.clear();
        });

    },

    deleteReleaseByTag:async(ghToken,owner, repo,tag,releaseIds,emptyTags) => {
        let options = {};
        options.owner = owner;
        options.tag = tag;
        options.repo = repo;
        options.token = ghToken;
        options.emptyTags = emptyTags;
        if(emptyTags){
            for(i=0;i<emptyTags.length;i++){
                await deleteReleaseId(emptyTags[i],options);
            }
        }
        else{
            for(i=0;i<releaseIds.length;i++){
                await deleteReleaseId(releaseIds[i],options);
            }
        }
    }

    
};
var multiprog = require("./progressbar.util");
var multi = new multiprog(process.stderr);
var nameBarSet = [];
function createBars(name,size){
    var bar = multi.newBar(chalk.green(' uploading '+name)+'\t\t [:bar] :percent :etas', {
        complete: chalk.cyan('█'),
        incomplete: chalk.cyan('░'),
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

function validateGHToken(ghToken) {
    octokit.authenticate({
        type: 'oauth',
        token: ghToken
    });
}

async function deleteReleaseId(id,opts){
    var deleteTagUri;
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
            console.log(chalk.green("\nSuccess(")+chalk.cyan(response.statusCode)+chalk.green(" ): Tag ")+chalk.cyan(opts.tag)+chalk.green(" deleted successfully!"));
        })
        .catch(function (err) {
            console.log(chalk.red('\nError('+chalk.cyan(err.statusCode)+'): ')+chalk.red(err.error.message+' for tag ')+chalk.cyan(id));
        });
  }

