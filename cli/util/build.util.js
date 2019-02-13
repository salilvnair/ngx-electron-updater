const inquirer = require('./inquirer.util');
const chalk = require('chalk');
const shellJs = require('shelljs');
const { ngxeu_scripts } = require('../package.json')
const jsonfile = require('jsonfile');
const fs = require('fs');
let ngxeuinclude = require('./ngxeu.util');
require('./date.util');

module.exports =  {

    buildElectronApp: (appName) =>{
        console.log(chalk.green('\nBumping the version... ' +chalk.cyan(appName)+'.'));
        let updateVersionCmd = "npm version patch";
        shellJs.exec(updateVersionCmd);
        console.log(chalk.green('\nPackaging... ' +chalk.cyan(appName)+'.'));
        let runElectronBuild = "npm run ngxeu-build";
        shellJs.exec(runElectronBuild);
    },

    createReleaseInfo: (appName) =>{
        console.log(chalk.green('\nCreating release info... ' +chalk.cyan(appName)+'.')); 
        let packageJson = jsonfile.readFileSync('./package.json');
        let currentVersion = packageJson.version;
        let releaseDate = new Date().format("dd/mm/yyyy");
        let releaseInfo = {
            "name" : appName+"",
            "version": currentVersion+"",
            "released_at":releaseDate+""
        }
        jsonfile.writeFileSync('./app-release.json',releaseInfo,{spaces: 2, EOL: '\r\n'});  
    },
    
    installElectronBuilderPromt: async (appName) => {
        let answer = await promptElectronBuilderNpmInstall(appName);
        if(answer){
            installElectronBuilder(appName);
            buildElectronApp(appName);
        }
    },

    hasElectronBuilderInstalled() {
        let packageJson = jsonfile.readFileSync('./package.json');
        if(packageJson.devDependencies){
            if(packageJson.devDependencies["electron-builder"]){
                return true;
            }
        }
        return false;
    },
    checkIfElectronProject :async(args, appName) =>{
        if(fs.existsSync('./package.json')){
            if(fs.existsSync('./main.js')){
                return true;
            }
            else{
                console.log(chalk.red.bold('\nCurrent directory is not a valid electron project directory, please choose a proper one!\n'));  
            }
        }
        else{
            console.log(chalk.red.bold('\nCurrent directory is not a npm managed project, please choose a proper one!\n'));  
            return false;
        }

    },
    modifyPackageJson: (args, appName, electronBuildCmd) =>{
        let packageJson = jsonfile.readFileSync('./package.json');
        if(!args['no-default']){
            let includeData = ngxeuIncludeData();
            let finalFilesArray = ["**/*"]
            if(includeData){
                finalFilesArray = finalFilesArray.concat(includeData);
            }
            let defautBuild = {
                "asar":false,
                "appId":appName,
                "productName":appName,
                "files": finalFilesArray,
                "mac": {
                "target": [
                    "zip"
                ]
                },
                "win": {
                "target": [
                    "zip"
                ]
                }

            }
            packageJson.build = defautBuild;
        }
        
        if(packageJson.scripts){
            packageJson.scripts["ngxeu-build"] = electronBuildCmd;
        }
        else{
            let scripts = {};
            scripts["ngxeu-build"] = electronBuildCmd;
            packageJson.scripts = scripts;
        }
        //console.log(packageJson);
        jsonfile.writeFileSync('./package.json',packageJson,{spaces: 2, EOL: '\r\n'});
    },

    prepareElectronBuildCmd: (args) => {
        let electron_build_cmd;
        let electron_build = ngxeu_scripts["build"];
        let electron_build_debug = ngxeu_scripts["build-debug"];
        if(args.m||args.mac){
            electron_build_cmd = electron_build + ' --mac'; 
            if(args.debug){
                electron_build_cmd = electron_build_debug + ' --mac'
            }
        }
        else if(args.w||args.win){
            electron_build_cmd = electron_build + ' --win'; 
            if(args.debug){
                electron_build_cmd = electron_build_debug + ' --win'; 
            }
        } 
        return electron_build_cmd;
    },
    showDefaultBuildConfig: (args, appName) => {
        let includeData = ngxeuIncludeData();
        let finalFilesArray = ["**/*"]
        if(includeData){
            finalFilesArray = finalFilesArray.concat(includeData);
        }
        let defautBuild = {
            "asar":false,
            "appId":appName,
            "productName":appName,
            "files": finalFilesArray,
            "mac": {
            "target": [
                "zip"
            ]
            },
            "win": {
            "target": [
                "zip"
            ]
            }

        }
        console.log(chalk.cyan(JSON.stringify(defautBuild, null, 2)));
    }

}

async function promptElectronBuilderNpmInstall (appName){
    console.log(chalk.underline.red.bold('\nElectron builder dependency is missing in '+chalk.cyan(appName)+'!\n'));
    let message = 'Do you want to install it now?';
    const input = await inquirer.askConfirmationQuestion(message);
    if(input) {           
        return input.question;
    }
}

function installElectronBuilder(appName) {
    console.log(chalk.green('\ninstalling... electron-builder in ' +chalk.cyan(appName)+' app.'));
    let electronBuildInstallCmd = 'npm install --save-dev electron-builder'
    shellJs.exec(electronBuildInstallCmd);
}

function buildElectronApp(appName) {
    console.log(chalk.green('\nPackaging... ' +chalk.cyan(appName)+' app.'));
    let runElectronBuild = "npm run ngxeu-build";
    shellJs.exec(runElectronBuild);
}

function ngxeuIncludeData(){
    if(ngxeuinclude.parse('./.ngxeuinclude')){
        return ngxeuinclude.parse('./.ngxeuinclude').patterns;
    }
    else{
        return null;
    }
}