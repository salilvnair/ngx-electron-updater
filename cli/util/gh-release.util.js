const chalk = require('chalk');
const Octokit = require('@octokit/rest');
const octokit = new Octokit();
var prettyBytes = require('pretty-bytes');
const cliSpinners = require('cli-spinners');
var log = require('single-line-log').stdout;
const GithubPublishUtil = require('../util/github-publish.util');
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
        githubPublishUtil.on('asset-info', function (name,size) {
            createBars(name,size);
        });
        githubPublishUtil.on('upload-progress', (name, progress)=>{            
            notifyMultipleProgress(name, progress);
        });
        githubPublishUtil.on('uploaded-asset', function () {
            log.clear();
        });

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