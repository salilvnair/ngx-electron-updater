const buildUtil = require('../util/build.util');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
module.exports = async (args) => {
    if(!args._[1]){
        console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu build '+chalk.cyan('MyApp'));
        process.exit();
    }
    
    let appName = args._[1];

    if(args["show-default"]){
        buildUtil.showDefaultBuildConfig(args, appName);
        process.exit();
    }
    
    if(!args.type && !args.t){
        console.log(chalk.red('\nError:Build type is not specified please specify using command:')+' ngxeu build MyApp'+chalk.cyan(' --type=angular or --type=ng or --type=electron or --type=e'));
        process.exit();
    }
    else {
        let buildType = args.type||args.t;
        if(!buildType==='angular'&& !buildType==='ng'
            && !buildType==='electron'&& !buildType==='e'){
            console.log(chalk.red('\nError:Build type should be one of these:')+chalk.cyan('--type=angular or --type=ng or --type=electron or --type=e'));
            process.exit();
        }
    }

    if(!await processBuild(args, appName)){
        require('./help')(args);
        process.exit();
    }
}

async function processBuild(args, appName) {
    let buildType = args.type||args.t;
    clear();
    if(buildType==='electron'||buildType==='e'){
        await processElectronBuild(args, appName);
    }
    else {
        await processAngularBuild(args, appName);
    }
    return true;
}

async function processAngularBuild(args, appName) {
    let angularBuildCmd = buildUtil.prepareAngularBuildCmd(args, appName);
    //console.log(electronBuildCmd);
    if(angularBuildCmd){
        buildUtil.modifyPackageJson(args, appName, angularBuildCmd);
        buildUtil.ngBuild(args,appName);
        await buildUtil.ngPack(appName);
        buildUtil.createReleaseInfo(args,appName);
        return true;
    }
    else{
        return false;
    }
}
 async function processElectronBuild(args, appName) {
    let isElectronProject = await buildUtil.checkIfElectronProject(args, appName);
    if(!isElectronProject){
        process.exit();
    }
    let angularBuildCmd = buildUtil.prepareAngularBuildCmd(args, appName);
    //console.log(electronBuildCmd);
    if(angularBuildCmd && !args["skip-ng"]){
        buildUtil.modifyPackageJson(args, appName, angularBuildCmd);
        buildUtil.ngBuild(args,appName);
        let electronBuildCmd = buildUtil.prepareElectronBuildCmd(args, appName);
        buildUtil.moveAndInstallElectronPackage(args,appName,electronBuildCmd); 
        if(args.icon||args.i){
            buildUtil.copyIconToBuild(args, appName); 
        }
    }
    if(args.pack||args.p){
        console.log(chalk.red(figlet.textSync('Packaging '+appName,{ font:'Doom'})));
        let electronPackageJsonPath = buildUtil.electronBuildPath(args,appName);
        buildUtil.electronBuild(args,appName,electronPackageJsonPath);
        buildUtil.createReleaseInfo(args,appName);  
        console.log(chalk.green(figlet.textSync('\nFinished!!!',{ font:'Doom'})));       
    }
    return true;
}
