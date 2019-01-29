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
            log.clear();
            console.log('\nDone! Published at: ' + release.html_url)
            process.exit(0)
        });
        githubPublishUtil.on('upload-progress', (name, progress)=>{            
            notifyProgress(name, progress);
        });
        githubPublishUtil.on('upload-asset', function () {
                       log.clear();
        })
        githubPublishUtil.on('uploaded-asset', function (name) {
        })
    }
    
};
let i = 0;
function notifyProgress (name, progress) {
    var pct = progress.percentage
    var speed = prettyBytes(progress.speed)
    const spinner = cliSpinners.clock;
    const frames = spinner.frames;
    var bar = Array(Math.floor(50 * pct / 100)).join('▩')+'▶'
    while (bar.length < 50) bar += ' ';
    let timer = chalk.cyan(frames[i = ++i % frames.length]);
    let uploadTxt = '\nUploading';
    if(pct.toFixed(1)>99){
        timer='';
        uploadTxt = '\nUploaded';
    }
    log(
        `${chalk.green(uploadTxt+' ' + name)}
[${chalk.green(bar)}${timer}] ${chalk.yellow(pct.toFixed(1))} % ( ${chalk.blue(speed)} /s)\n`
      )
}

function validateGHToken(ghToken) {
    octokit.authenticate({
        type: 'oauth',
        token: ghToken
    });
}