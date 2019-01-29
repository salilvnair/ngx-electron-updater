const inquirer = require('./inquirer.util');
const pkg = require('../package.json');
const Configstore = require('configstore');
const conf = new Configstore(pkg.name);
const chalk = require('chalk');
var shell = require('shelljs');
module.exports = {
    getStoredGithubToken : (appName) => {
        return conf.get(appName+'.github.token');
    },

    generateNewToken : async (appName) => {
        const tokenUrl = 'https://github.com/settings/tokens';
        console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Generate new token button.\n'));
        const input = await inquirer.askRegeneratedToken();
        if(input) {
            conf.set(appName+'.github.token', input.token);
            return input.token;
        }
    },

    getStoredRepoDetails : (appName) => {
        let user = conf.get(appName+'.github.user');
        let repo = conf.get(appName+'.github.repo');
        if(repo && user){
            return {user:user,repo:repo};
        }
        else{
            return null;
        }
    },
    generateRepositoryDetails : async (appName) => {
        console.log(chalk.underline.blue.bold('Please enter repository details.'));
        const input = await inquirer.askRepoDetails();
        if(input) {
            conf.set(appName+'.github.user', input.user);
            conf.set(appName+'.github.repo', input.repo);
            return {user:input.user,repo:input.repo};
        }
    },

    // uploadReleaseAsset: (token) => { 
    //     var releaseAssetCmd = "sh ./util/gh-release.util.sh gh_token="+token+" owner=salilvnair repo=vdemy tag=v0.0.3 filename=./test.txt"
    //     console.log(releaseAssetCmd);
    //     console.log(shell.exec(releaseAssetCmd)); 
    // }

};