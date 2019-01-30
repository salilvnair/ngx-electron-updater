const buildUtil = require('../util/build.util');
const chalk = require('chalk');
module.exports = async (args) => {
    if(!args._[1]){
        console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu build '+chalk.cyan('MyApp'));
        process.exit();
    }
    let appName = args._[1];
    
    let isElectronProject = await buildUtil.checkIfElectronProject(args, appName);
    if(!isElectronProject){
        process.exit();
    }
    if(args["show-default"]){
        buildUtil.showDefaultBuildConfig(args, appName);
        process.exit();
    }
    if(!await processElectronBuild(args, appName)){
        require('./help')(args);
        process.exit();
    }
}

 async function processElectronBuild(args, appName) {
    let electronBuildCmd = buildUtil.prepareElectronBuildCmd(args, appName);
    //console.log(electronBuildCmd);
    if(electronBuildCmd){
        buildUtil.modifyPackageJson(args, appName, electronBuildCmd);
        if(!buildUtil.hasElectronBuilderInstalled()){
            await buildUtil.installElectronBuilderPromt(appName);
        }
        else{
            buildUtil.buildElectronApp(appName);
            buildUtil.createReleaseInfo(appName);
        } 
        return true;
    }
    else{
        return false;
    }
}
