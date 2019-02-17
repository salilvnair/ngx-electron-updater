const inquirer = require('./inquirer.util');
const chalk = require('chalk');
const shellJs = require('shelljs');
const { ngxeu_scripts } = require('../package.json')
const jsonfile = require('jsonfile');
const fs = require('fs');
let ngxeuinclude = require('./ngxeu.util');
var archiver = require('archiver');
const path = require('path');
require('./date.util');
const figlet = require('figlet');
const clear = require('clear');
const fsExtra = require("fs-extra");
const commonUtil    = require('./common.util');

module.exports =  {

    ngBuild: (args,appName) =>{
        ngxeuBuild(args,appName,'.',false);
    },
    electronBuild:(args,appName,electronPackageJsonPath) =>{
        ngxeuBuild(args,appName,electronPackageJsonPath,true);
    },
    ngPack:async (appName) => {
        await archiveAngularBuild(appName);
    },

    createReleaseInfo: (args, appName) =>{
        let packageJson = jsonfile.readFileSync('./package.json');
        let currentVersion = packageJson.version;
        let appNameZipWithVersion = getAppNameZipWithVersionAndPlatform(appName,packageJson);
        console.log(chalk.green('\nCreating release info for ' +chalk.cyan(appNameZipWithVersion)+' !!')); 
        let releaseDate = new Date().format("dd/mm/yyyy");
        let updateType = "";
        if(args.type||args.t){
            updateType = args.type||args.t;
        }
        let appReleaseInfoPath;
        let releaseType = "angular";
        if(updateType==="ng"||updateType==="angular"){
            appReleaseInfoPath =  packageJson.ngxeu["ng-build"].packPath;
            releaseType = "angular";
        }
        else {
            releaseType = "electron";
            appReleaseInfoPath =  packageJson.ngxeu["app-build"].packPath;
        }
        appReleaseInfoPath = appReleaseInfoPath+'/app-release.json';

        let releaseInfo = {
            "name" : appName+"",
            "version": currentVersion+"",
            "released_at":releaseDate+"",
            "release_type":releaseType+""
        }
        jsonfile.writeFileSync(appReleaseInfoPath,releaseInfo,{spaces: 2, EOL: '\r\n'});  
        console.log(chalk.green('\nRelease info for ' +chalk.cyan(appNameZipWithVersion)+' created successfully!!')); 
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
    modifyPackageJson: (args, appName, buildCmd) =>{
        let packageJson = jsonfile.readFileSync('./package.json');
        let updateType;
        if(args.type||args.t){
            updateType = args.type||args.t;
        }
        if(updateType==='electron'||updateType==='e'){
            modifyAngularJsonForElectronBuild(args,appName,packageJson,buildCmd);           
        }
        else{
           //need to modify current angular.json
           //with ngxeu["ng-build"]
           modifyAngularJsonForNgBuild(args,appName,packageJson,buildCmd);
        }
    },

    prepareAngularBuildCmd: (args) => {
        return ngxeu_scripts["ng-build"];
    },
    prepareElectronBuildCmd: (args) => {
        let electron_build_cmd;
        let electron_build = ngxeu_scripts["electron-build"];
        let electron_build_debug = ngxeu_scripts["electron-build-debug"];
        let platform = getAppPlatform();
        electron_build_cmd = electron_build + ' --'+platform; 
        if(args.debug){
            electron_build_cmd = electron_build_debug + ' --'+platform; 
        }
        return electron_build_cmd;
    },
    moveAndInstallElectronPackage: (args, appName, electronBuildCmd) => {
        return processMoveAndInstallElectronPackage(args, appName, electronBuildCmd);
    },
    showDefaultBuildConfig: (args, appName) => {
        let includeData = ngxeuIncludeData();
        let finalFilesArray = ["**/*"]
        if(includeData){
            finalFilesArray = finalFilesArray.concat(includeData);
            finalFilesArray.push("!src");
        }
        else{
            finalFilesArray.push("build");
            finalFilesArray.push("!src");
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

function injectNgxeuBuildScript(packageJson, buildCmd,packagePath) {
    let packJsonFile = packagePath+"/package.json"
    if(!packageJson){
        packageJson = jsonfile.readFileSync(packJsonFile);
    }
    if(packageJson.scripts){
        packageJson.scripts["ngxeu-build"] = buildCmd;
    }
    else{
        let scripts = {};
        scripts["ngxeu-build"] = buildCmd;
        packageJson.scripts = scripts;
    }
    //console.log(packageJson);
    jsonfile.writeFileSync(packJsonFile,packageJson,{spaces: 2, EOL: '\r\n'});
}

function modifyAngularJsonForNgBuild(args,appName,packageJson,buildCmd) {
    if(!fs.existsSync('./angular.json') && !fs.existsSync('./.angular-cli.json')){
        console.log(chalk.underline.red.bold('\nAngular json file is missing, make sure its an Angular application!'));
    }
    else{
        if(fs.existsSync('./angular.json')){
            let angularJson = jsonfile.readFileSync('./angular.json');
            angularJson.projects[appName].architect.build.options.outputPath = packageJson.ngxeu["ng-build"].outputPath;
            jsonfile.writeFileSync('./angular.json',angularJson,{spaces: 2, EOL: '\r\n'});
        }
        if(fs.existsSync('./.angular-cli.json')){
            let angularJson = jsonfile.readFileSync('./.angular-cli.json');
            angularJson.apps[0].outDir = packageJson.ngxeu["ng-build"].outputPath;
            jsonfile.writeFileSync('./.angular-cli.json',angularJson,{spaces: 2, EOL: '\r\n'});
        }
    }
    injectNgxeuBuildScript(packageJson,buildCmd,"./");
}

function configureBuildCommandInElectronPackageJson(args,appName,packageJson) {
    if(!args['no-default']){
        let includeData = ngxeuIncludeData();
        let finalFilesArray = ["**/*"]
        if(includeData){
            finalFilesArray = finalFilesArray.concat(includeData);
            finalFilesArray.push("!src");
        }
        else{
            finalFilesArray.push("build");
            finalFilesArray.push("!src");
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
    return packageJson;
}

function modifyAngularJsonForElectronBuild(args,appName,packageJson,buildCmd) {
    if(!fs.existsSync('./angular.json') && !fs.existsSync('./.angular-cli.json')){
        console.log(chalk.underline.red.bold('\nAngular json file is missing, make sure its an Angular application!'));
    }
    else{
        if(fs.existsSync('./angular.json')){
            let angularJson = jsonfile.readFileSync('./angular.json');
            angularJson.projects[appName].architect.build.options.outputPath = packageJson.ngxeu["app-build"].outputPath;
            jsonfile.writeFileSync('./angular.json',angularJson,{spaces: 2, EOL: '\r\n'});
        }
        if(fs.existsSync('./.angular-cli.json')){
            let angularJson = jsonfile.readFileSync('./.angular-cli.json');
            angularJson.apps[0].outDir = packageJson.ngxeu["app-build"].outputPath;
            jsonfile.writeFileSync('./.angular-cli.json',angularJson,{spaces: 2, EOL: '\r\n'});
        }
    }
    injectNgxeuBuildScript(packageJson,buildCmd,"./");
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

async function archiveAngularBuild(appName){
    let packageJson = jsonfile.readFileSync('./package.json');
    let srcFolder = getAngularBuildFolder(appName,packageJson);
    let zipRelativePath = getAngularPackFolder(appName,packageJson);
    await archive(srcFolder,zipRelativePath);
}

function getAngularBuildFolder(appName,packageJson) {
    return getNgxeu(appName,packageJson)["ng-build"].outputPath;
}

function getAngularPackFolder(appName,packageJson) {
    let destPath =  getNgxeu(appName,packageJson)["ng-build"].packPath;
    forceCreateDirIfNotExist(destPath);
    let packRelativePath = getAppZipFileFullPath(appName,destPath);
    return packRelativePath;                
}

function getElectronBuildFolder(appName,packageJson) {
    return getNgxeu(appName,packageJson).app.rootPath
}

function getNgxeu(appName,packageJson) {
    return packageJson.ngxeu;
}

function getAppZipFileFullPath(appName,destPath,packageJson){
    let appZipName = getAppNameZipWithVersionAndPlatform(appName,packageJson);
    destPath = destPath+"/"+appZipName;
    return destPath;
}

function getAppPlatform() {
    if(this.process.platform==='win32'){
        return "win";
    }
    else if(this.process.platform==='darwin'){
       return "mac";
    }
    else{
        return "unknown"
    }
}

function getAppNameZipWithVersionAndPlatform(appName,packageJson){
    if(!packageJson){
        packageJson = jsonfile.readFileSync('./package.json');
    }
    let appNameWithVersion = appName+"-"+packageJson.version;
    let appZipName;
    if(this.process.platform==='win32'){
        appZipName = appNameWithVersion+'-win.zip';
    }
    else if(this.process.platform==='darwin'){
        appZipName = appNameWithVersion+'-mac.zip';
    }
    return appZipName;
}

function forceCreateDirIfNotExist(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (err.code==="ENOENT") {
        forceCreateDir(path.dirname(dir)); //create parent dir
        forceCreateDir(dir); //create dir
      }
    }
}

function ngxeuBuild(args,appName,pkgJsonFilePath,cont) {
    let pkgJsonFileName = "/package.json";
    let tempPath = shellJs.pwd();
    let packageJsonFile = pkgJsonFilePath+pkgJsonFileName
    if(!cont) {
        clear();
        let figi = 'Building '+ appName;
        console.log(
            chalk.red(figlet.textSync(figi, { font:'Doom'}))
        );
        if(args.pack||args.p){
            let version = args.pack||args.p;
            let packageJson = jsonfile.readFileSync(packageJsonFile);
            packageJson.version = version;
            console.log(chalk.green('\nBuild app using the version ' +chalk.cyan(version)+'.'));
            jsonfile.writeFileSync(packageJsonFile,packageJson,{spaces: 2, EOL: '\r\n'});  
        }
        else{
            let bumpVal = "major";
            if(args.bump||args.b){
                bumpVal = args.bump||args.b;
            }
            console.log(chalk.green('\nBumping the version...'));
            let updateVersionCmd = "npm version "+bumpVal;
            shellJs.exec(updateVersionCmd);
        }
    }
    if(!cont) {
        console.log(chalk.green('\nBuilding... ' +chalk.cyan(appName)+'.'));
    }
    else{
        console.log(chalk.green('\nPackaging... ' +chalk.cyan(appName)+'.'));
    }
    shellJs.cd(pkgJsonFilePath);
    let runElectronBuild = "npm run ngxeu-build";
    if (shellJs.exec(runElectronBuild).code !== 0) {
        console.log(chalk.underline.red.bold('\nPackaging Failed... '));
        process.exit();
    }    
    shellJs.cd(tempPath);
}

function  processMoveAndInstallElectronPackage(args, appName, electronBuildCmd){
    let newElectronRootPath = processElectronAsSeperateApp(args, appName, electronBuildCmd);
    installElectronApp(newElectronRootPath);
    return newElectronRootPath;
}

function processElectronAsSeperateApp(args, appName, electronBuildCmd) {
    let packageJson = jsonfile.readFileSync('./package.json');
    let newElectronRootPath = getElectronBuildFolder(appName,packageJson);
    forceCreateDirIfNotExist(newElectronRootPath);
    let ngxeu = getNgxeu(appName,packageJson);
    console.log(chalk.green('\nConfiguring the electron...'));
    packageJson.devDependencies = ngxeu.app.devDependencies;
    packageJson.dependencies = ngxeu.app.dependencies;
    packageJson = configureBuildCommandInElectronPackageJson(args, appName,packageJson);
    injectNgxeuBuildScript(packageJson,electronBuildCmd,newElectronRootPath);
    var mainJsFileContent = fs.readFileSync('./main.js', 'utf8');
    let mainJsCopyPath = path.join(newElectronRootPath,"main.js");
    fs.writeFileSync(mainJsCopyPath,mainJsFileContent);
    let jsLibCopyPath = path.join(newElectronRootPath,"js_lib");
    if(fs.existsSync("./js_lib")){
        fsExtra.copySync("./js_lib", jsLibCopyPath);
    }
    return newElectronRootPath;
}

function installElectronApp (newElectronRootPath) {
    let tempPath = shellJs.pwd();
    shellJs.cd(newElectronRootPath);
    shellJs.rm('-rf', './node_modules');    
    let electronBuildInstallCmd = 'npm install';
    console.log(chalk.yellow('\nInstalling '+chalk.cyan('electron')+' ,'+chalk.cyan('electron builder')+' and other app dependencies.'));
    shellJs.exec(electronBuildInstallCmd);
    shellJs.cd(tempPath);
}

function archive(srcFolder,zipRelativePath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(zipRelativePath);
  
    return new Promise((resolve, reject) => {
      archive
        .directory(srcFolder, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => {        
        let fileName = path.basename(zipRelativePath);
        let dir = path.dirname(zipRelativePath);
        let existingDir = shellJs.pwd();
        shellJs.cd(dir);
        let zipFullPath = shellJs.pwd();
        shellJs.cd(existingDir);
        console.log(chalk.green('\nPackage '+chalk.cyan(fileName)+' created at '+chalk.cyan(zipFullPath) +' successfully!!'));    
        resolve()
      });
      archive.finalize();
    });
}