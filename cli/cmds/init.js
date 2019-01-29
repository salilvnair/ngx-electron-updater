const github = require('../util/github-inquirer.util-inquirer.util');
const chalk = require('chalk');
module.exports = async (args) => {
    try {
        //console.log(args)
        if(!args._[1]){
            console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu init '+chalk.cyan('MyApp'));
            process.exit();
        }
        let appName = args._[1];
        await getGitHubAccessToken(appName);
        await getGitHubRepositoryDetails(appName);

    } catch (err) {
      console.error(err)
    }
  }
  let getGitHubAccessToken = async(appName) =>{
    // Check if access token for ginit was registered
    let accessToken = github.getStoredGithubToken(appName);
    if(!accessToken) {
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