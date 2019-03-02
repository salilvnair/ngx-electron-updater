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
    copyDefaultMainTemplateIntoRootDir(args,appRootDir);
    setInfoInPackageJson(args,appRootDir);
    if(args['skip-el']){
        console.log(chalk.red(figlet.textSync('Fused',{font:'Fire Font-k'})));
        process.exit();
    }
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
    if(args.ts){
        packageJson.main = "./dist/main.js";
        packageJson.scripts["build-electron"] = "cd main/core && tsc";
        packageJson.scripts["build-lib"] = "cd main/ts-lib && tsc";
        packageJson.scripts["build"] = "npm run build-lib && npm run build-electron";
        packageJson.scripts["fire"] = "npm run build && npm run electron";
    }
    let ngxeu = {
        app:{
            dependencies:{
                "nedb": "^1.8.0",
                "jsonfile": "^5.0.0",
                "fs-extra":"^7.0.1",
                "@ngxeu/util":"^4.0.2"
            },
            devDependencies: electronDevDependencies,
            rootPath:"../<APP_NAME_STAGING>/electron"
        },
        "app-build":{
            outputPath:"../<APP_NAME_STAGING>/electron/build",
            packPath:"../<APP_NAME_STAGING>/electron/dist"
        },
        "ng-build":{
            outputPath:"../<APP_NAME_STAGING>/angular/build/resources/app/build",
            archivePath:"../<APP_NAME_STAGING>/angular/build",
            packPath:"../<APP_NAME_STAGING>/angular/dist"
        }
    }
    packageJson.ngxeu = ngxeu;
    jsonfile.writeFileSync(packageJsonPath,packageJson,{spaces: 2, EOL: '\r\n'});
}

function copyDefaultMainTemplateIntoRootDir(args,rootDir) {
    if(args.ts){
        let electronMainTemplateFile = "electron-main-template.ts";
        let electronMainFile = "main.ts";
        let libFolder = "ts-lib";
        let coreFolder = "core";
        let tsMainPath = path.join(rootDir,"main");
        let libCopyPath = path.join(tsMainPath,libFolder);
        forceCreateDirIfNotExist(libCopyPath);
        let corePath = path.join(tsMainPath,coreFolder);
        forceCreateDirIfNotExist(corePath);
        let electronMainTemplateFilePath = path.join(__dirname,'template',electronMainTemplateFile);
        var mainJsFileContent = fs.readFileSync(electronMainTemplateFilePath, 'utf8');    
        let mainJsCopyPath = path.join(corePath,electronMainFile);
        fs.writeFileSync(mainJsCopyPath,mainJsFileContent);

        let electronTsConfigMainJsPath = path.join(__dirname,'template',"mainjs-tsconfig.json");
        var tsConfigMainJsFileContent = fs.readFileSync(electronTsConfigMainJsPath, 'utf8'); 
        let tsConfigMainJsPath = path.join(corePath,"tsconfig.json");
        fs.writeFileSync(tsConfigMainJsPath,tsConfigMainJsFileContent);

        let electronTsConfigLibJsPath = path.join(__dirname,'template',"tslib-tsconfig.json");
        var tsConfigLibJsFileContent = fs.readFileSync(electronTsConfigLibJsPath, 'utf8'); 
        let tsConfigLibJsPath = path.join(libCopyPath,"tsconfig.json");
        fs.writeFileSync(tsConfigLibJsPath,tsConfigLibJsFileContent);

        let sampleTsPath = path.join(libCopyPath,"sample.ts");
        fs.writeFileSync(sampleTsPath,"");
    }
    else{
        let electronMainTemplateFile = "electron-main-template.js";
        let electronMainFile = "main.js";
        let libFolder = "js-lib";
        let electronMainTemplateFilePath = path.join(__dirname,'template',electronMainTemplateFile);
        var mainJsFileContent = fs.readFileSync(electronMainTemplateFilePath, 'utf8');    
        let mainJsCopyPath = path.join(rootDir,electronMainFile);
        fs.writeFileSync(mainJsCopyPath,mainJsFileContent);
        let libCopyPath = path.join(rootDir,libFolder);
        forceCreateDirIfNotExist(libCopyPath);
    }
}

async function promptInstallingNgxElectron (appName){
    console.log(chalk.underline.red.bold('\n\nFusion completed successfully! app created with name '+chalk.cyan(appName)+'!\n'));
    let message = 'Do you want to install ngx-electron module for additional feature?';
    const input = await inquirer.askConfirmationQuestion(message);
    if(input) {           
        return input.question;
    }
}

function forceCreateDirIfNotExist(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (err.code==="ENOENT") {
        forceCreateDirIfNotExist(path.dirname(dir)); //create parent dir
        forceCreateDirIfNotExist(dir); //create dir
      }
    }
}



