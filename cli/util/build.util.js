const inquirer = require('./inquirer');
const chalk = require('chalk');
const shellJs = require('shelljs');
const { ngxeu_scripts } = require('../package.json')
const jsonfile = require('jsonfile');

module.exports =  {

    buildElectronApp: (appName) =>{
        console.log(chalk.green('\nPackaging... ' +chalk.cyan(appName)+' app.'));
        let runElectronBuild = "npm run ngxeu-build";
        shellJs.exec(runElectronBuild);
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

    modifyPackageJson: (args, appName, electronBuildCmd) =>{
        if(args.default){
            let defaultBuildSrc = "build";
            if(args.src){
                defaultBuildSrc = src; 
            }
            let packageJson = jsonfile.readFileSync('./package.json');
            let defautBuild = {
                "asar":false,
                "appId":appName,
                "productName":appName,
                "files": [
                    "**/*",
                    defaultBuildSrc
                ],
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
            if(packageJson.scripts){
                packageJson.scripts["ngxeu-build"] = electronBuildCmd;
            }
            else{
                let scripts = {};
                scripts["ngxeu-build"] = electronBuildCmd;
                packageJson.scripts = scripts;
            }
            console.log(packageJson);
            jsonfile.writeFileSync('./package.json',packageJson,{spaces: 2, EOL: '\r\n'});
        }
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
        let defaultBuildSrc = "build";
        if(args.src){
            defaultBuildSrc = src; 
        }
        let defautBuild = {
            "asar":false,
            "appId":appName,
            "productName":appName,
            "files": [
                "**/*",
                defaultBuildSrc
            ],
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