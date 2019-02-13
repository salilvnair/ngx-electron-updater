const ghRelease = require('../util/gh-release.util')
const github = require('../util/github-inquirer.util');
const chalk = require('chalk');
const jsonfile = require('jsonfile')
module.exports = async (args) => {
    if(!args._[1]){
        console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu release '+chalk.cyan('MyApp'));
        process.exit();
    }
    let appName = args._[1];
    if((args.latest) && (args.out || args.o)) {
        let outputFileRelativeName = args.out || args.o;
        let listCmd = "latest";
        if(!!outputFileRelativeName){
            saveReleaseList(appName,outputFileRelativeName,listCmd);
        }
        else{
            require('./help')(args);
        }
    }
    else if(args.out || args.o) {
        let outputFileRelativeName = args.out || args.o;
        let listCmd = "all";
        if(!!outputFileRelativeName){
            saveReleaseList(appName,outputFileRelativeName,listCmd);
        }
        else{
            require('./help')(args);
        }
    }
    else if((args.latest) && (args.l || args.list)) {
        let listCmd = "latest";
        let latestReleaseResponse = await getReleaseList(appName, listCmd);
        console.log(chalk.cyan(JSON.stringify(latestReleaseResponse, null, 2)));
    }
    else if((args.l || args.list)) {
        let listCmd = "all";
        let latestReleaseResponse = await getReleaseList(appName, listCmd);
        console.log(chalk.cyan(JSON.stringify(latestReleaseResponse, null, 2)));
    }
    else{
        require('./help')(args);
    }
}


function getReleaseList(appName,listCmd){
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
    return ghRelease.listRelease(accessToken,repoDetails.user,repoDetails.repo,listCmd);       
}

function saveReleaseList(appName,outputFileRelativeName,listCmd){
    getReleaseList(appName, listCmd).then(response=>{
        jsonfile.writeFile(outputFileRelativeName, response)
        .then(res => {
          console.log(chalk.green('output saved to the file: ')+outputFileRelativeName);
        })
        .catch(error => console.error(error))
    })
}