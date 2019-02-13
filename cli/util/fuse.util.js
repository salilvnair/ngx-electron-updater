const inquirer = require('./inquirer.util');
const chalk = require('chalk');
const shellJs = require('shelljs');
const fs = require('fs');
const clear = require('clear');
const figlet = require('figlet');
var path = require('path');
const jsonfile = require('jsonfile');

module.exports =  {

    createAngularElectronApp: async (args,appName) =>{
        clear();
        console.log(
            chalk.green(figlet.textSync('Angular Electron Fusion', { font:'Doom'}))
        );
        await processCreatingNgElectronFusion(args,appName);
    },

}

async function processCreatingNgElectronFusion(args,appName) {
    if(args['skip-ng']){
        console.log(chalk.magenta('\n\nFusing your angular app with electron...'));
    }
    else{
        let hasAngularCmd = 'ng version';
        let hasAngularCmdOutput = shellJs.exec(hasAngularCmd,{silent:true});
        if(hasAngularCmdOutput.code!==0){
            let ngCliNotFoundPromt = await promptInstallAngularCliConfirmation(appName);
            if(ngCliNotFoundPromt){
                let installNgCliGlobally = "npm install -g @angular/cli";
                shellJs.exec(installNgCliGlobally);
            }
        }
        let createNewAngularCmd = "ng new "+appName;
        shellJs.exec(createNewAngularCmd);
        console.log(chalk.magenta('\n\nFusing it with electron...'));
        shellJs.cd(appName);
    }
   
    let appRootDir = shellJs.pwd()+"";
    copyDefaultMainTemplateIntoRootDir(appRootDir);
    setInfoInPackageJson(appRootDir);
    let installElectronCmd = "npm install electron --save-dev";
    shellJs.exec(installElectronCmd);
    console.log(chalk.red(figlet.textSync('Fused',{font:'Fire Font-k'})));
    let postFusionAnswer = await promptInstallingNgxElectron(appName);
    if(postFusionAnswer){
        let installNgxElectronCmd = "npm install ngx-electron";
        shellJs.exec(installNgxElectronCmd);
    }
    else{
        process.exit();
    }
}

function setInfoInPackageJson(rootDir) {
    let packageJsonPath = path.join(rootDir,"package.json");
    let packageJson = jsonfile.readFileSync(packageJsonPath);
    packageJson.main = "main.js";
    packageJson.scripts["electron"] = "./node_modules/.bin/electron .";
    jsonfile.writeFileSync(packageJsonPath,packageJson,{spaces: 2, EOL: '\r\n'});
}

function copyDefaultMainTemplateIntoRootDir(rootDir) {
    let electronMainTemplateFilePath = path.join(__dirname,'template','electron-main-template.js');
    var mainJsFileContent = fs.readFileSync(electronMainTemplateFilePath, 'utf8');
    let mainJsCopyPath = path.join(rootDir,"main.js");
    fs.writeFileSync(mainJsCopyPath,mainJsFileContent);
}

async function promptInstallingNgxElectron (appName){
    console.log(chalk.underline.red.bold('\n\nFusion completed successfully! app created with name '+chalk.cyan(appName)+'!\n'));
    let message = 'Do you want to install ngx-electron module for additional feature?';
    const input = await inquirer.askConfirmationQuestion(message);
    if(input) {           
        return input.question;
    }
}



