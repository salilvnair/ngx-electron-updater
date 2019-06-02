const github = require('../util/github-inquirer.util');
const chalk = require('chalk');
const ghRelease = require('../util/gh-release.util');
module.exports = async (args) => {
    try {
        //console.log(args)
        if(args.list||args.l){
            console.log(chalk.cyan(JSON.stringify(github.getAllConfigData(), null, 2)));
            process.exit();
        }
        if(!args._[1]){
            console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu init '+chalk.cyan('MyApp'));
            process.exit();
        }
        let appName = args._[1];
        if(args.clear||args.c){
            github.deleteStoredGithubToken(appName);
            github.deleteStoredRepoDetails(appName);
            console.log(chalk.green('cleared access token and repo details!'));
            process.exit();
        }
        if(args['clear-token']||args.ct){
            github.deleteStoredGithubToken(appName);
            github.deleteStoredRepoDetails(appName);
            console.log(chalk.green('cleared access token details!'));
            process.exit();
        }
        if(args['encypt-token']||args.et){
            console.log(chalk.green('encrypting access token!'));
            let repoDetails = github.getStoredRepoDetails(appName);
            let accessToken = github.getStoredGithubToken(appName);
            if(!accessToken && accessToken!='') {
                console.log(chalk.red('No access token has been found please set one!'));
            }
            else {
                let encryptedToken = ghRelease.encryptToken(repoDetails.user,repoDetails.repo,accessToken);
                console.log(chalk.yellow('Encrypted Token: ') + chalk.cyan(encryptedToken));
            }
            process.exit();
        }
        if(args['decrypt-token']||args.dt){
            let encryptedToken = args['decrypt-token']||args.dt;
            console.log(chalk.green('decrypting access token!'));
            let repoDetails = github.getStoredRepoDetails(appName);
            let accessToken = github.getStoredGithubToken(appName);
            if(!accessToken && accessToken!='') {
                console.log(chalk.red('No access token has been found please set one!'));
            }
            else {
                let decryptedToken = ghRelease.decryptToken(repoDetails.user,repoDetails.repo,encryptedToken);
                console.log(chalk.yellow('Decrypted Token: ') + chalk.cyan(decryptedToken));
            }
            process.exit();
        }
        if(args['clear-repodetails']||args.cr){
            github.deleteStoredGithubToken(appName);
            github.deleteStoredRepoDetails(appName);
            console.log(chalk.green('cleared repo details!'));
            process.exit();
        }
        await getGitHubAccessToken(appName);
        await getGitHubRepositoryDetails(appName);

    } catch (err) {
      console.error(err)
    }
  }
  let getGitHubAccessToken = async(appName) =>{
    // Check if access token for ginit was registered
    let accessToken = github.getStoredGithubToken(appName);
    if(!accessToken && accessToken!='') {
        console.log(chalk.red('No access token has been found please set one!'));
        // ask user to generate a new token
        accessToken = await github.generateNewToken(appName);
        return accessToken;
    }
    else{
        console.log(chalk.yellow('Existing token found: ') + chalk.cyan(accessToken));
    }
    return accessToken
}

let getGitHubRepositoryDetails = async(appName) =>{
    // Check if access token for ginit was registered
    let repoDetails = github.getStoredRepoDetails(appName);
    if(!repoDetails) {
        console.log(chalk.red('Repo details not found please set one!'));
        // ask user to generate a new token
        repoDetails = await github.generateRepositoryDetails(appName);
        return repoDetails;
    }
    else{
        console.log(chalk.yellow('Existing repo details found: ') + chalk.cyan(JSON.stringify(repoDetails)));
    }
    return repoDetails
}