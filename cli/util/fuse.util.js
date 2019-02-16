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
    injectingNgxeuInPackageJson: (args,appName) =>{
        clear();
        console.log(
            chalk.green(figlet.textSync('Ngxeu Injection', { font:'Doom'}))
        );
        processInjectingNgxeuInPackageJson(args,appName);
    },
}

async function processInjectingNgxeuInPackageJson(args,appName) {
    let appRootDir = shellJs.pwd()+"";
    setInfoInPackageJson(args,appRootDir);
    console.log(chalk.magenta('\n\nNgxeu Build Config Injection completed!!'));
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
    setInfoInPackageJson(args,appRootDir);
    let installElectronCmd = "npm install electron --save-dev";
    shellJs.exec(installElectronCmd);

    let installElectronBuilderCmd = "npm install electron-builder --save-dev";
    shellJs.exec(installElectronBuilderCmd);
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

function setInfoInPackageJson(args,rootDir) {
    let packageJsonPath = path.join(rootDir,"package.json");
    let packageJson = jsonfile.readFileSync(packageJsonPath);
    packageJson.main = "main.js";
    let existingDevDependencies = packageJson.devDependencies;
    let electronDevDependencies = {};
    if(existingDevDependencies["electron"]){
        electronDevDependencies["electron"] = existingDevDependencies["electron"]+"";
    }
    else{
        electronDevDependencies["electron"] ="^4.0.1";
    }
    if(existingDevDependencies["electron-builder"]){
        electronDevDependencies["electron-builder"] = existingDevDependencies["electron-builder"]+"";
    }
    else{
        electronDevDependencies["electron-builder"] =  "^20.38.2";
    }
    packageJson.scripts["electron"] = "./node_modules/.bin/electron .";
    let ngxeu = {
        app:{
            dependencies:{
                "nedb": "^1.8.0"
            },
            devDependencies: existingDevDependencies,
            rootPath:"../ngxeu/electron"
        },
        "app-build":{
            outputPath:"../ngxeu/electron/build",
            packPath:"../ngxeu/electron/dist"
        },
        "ng-build":{
            outputPath:"../ngxeu/angular/build",
            packPath:"../ngxeu/angular/dist"
        }
    }
    packageJson.ngxeu = ngxeu;
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



