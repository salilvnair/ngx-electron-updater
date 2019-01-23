const github = require('../util/github');
const chalk = require('chalk');
const ghRelease = require('../util/gh-release.util')
module.exports = async (args, draft) => {
    try {
        let files;
        let tag;
        if(args.f || args.file) {
            let fileArgs = args.f || args.file;
            files = [];
            files = fileArgs.split(",");
            //console.log(files);
        }
        else{
            console.log(chalk.red('\nError:file(s) path not mentioned please pass using command:')+' ngxeu publish'+chalk.cyan(' -f ./test.zip'));
            process.exit();
        }
        if(args.t || args.tag) {
            tag = args.t || args.tag;
            //console.log(tag);
        }
        else{
            console.log(chalk.red('\nError:release/draft tag name is not mentioned please pass using command:')+' ngxeu publish'+chalk.cyan(' -t v1.0.0'));
            process.exit();
        }
        draft = true;
        if(args.release) {
            draft = false;
        }
        if(!args._[1]){
            console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu publish '+chalk.cyan('MyApp'));
            process.exit();
        }
        let appName = args._[1];
        processPublish(tag, files, draft,appName);
        
    } catch (err) {
      console.error(err)
    }
  }

  function processPublish(tag, files, draft,appName){
        let accessToken = github.getStoredGithubToken(appName);        
        if(!accessToken) {
           console.log(chalk.red('\nError:access token not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
           process.exit();
        }
        let repoDetails = github.getStoredRepoDetails(appName);
        if(!repoDetails){
            console.log(chalk.red('\nError:repository details not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
            process.exit();
        }
        ghRelease.uploadAsset(accessToken,repoDetails.user,repoDetails.repo,tag,files,draft);       

  }