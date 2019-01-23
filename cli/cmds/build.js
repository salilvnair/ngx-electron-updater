const { ngxeu_scripts } = require('../package.json')
const shellJs = require('shelljs');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
module.exports = (args) => {
    if(!args._[1]){
        console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu build '+chalk.cyan('MyApp'));
        process.exit();
    }
    let appName = args._[1];
    if(!processElectronBuild(args, appName)){
        require('./help')(args);
        process.exit();
    }
}

function processElectronBuild(args, appName) {
   if(prepareElectronBuildCmd(args, appName)){
    let electronBuildCmd = prepareElectronBuildCmd(args, appName);
    console.log(electronBuildCmd)
    modifyPackageJson(args, appName);
    hasElectronBuilderInstalled(args, appName);   
    console.log(shellJs.exec(electronBuildCmd,{async:false}));
    return true;
   }
   else{
       return false;
   }
}

function hasElectronBuilderInstalled(args, appName) {
    let packageJson = jsonfile.readFileSync('./package.json');
    if(packageJson.dependencies){
        if(packageJson.dependencies["electron-builder"]){
            return true;
        }
    }
    if(packageJson.dependencies){
        if(packageJson.devDependencies["electron-builder"]){
            return true;
        }
    }
    return false;
}

function modifyPackageJson(args, appName){
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
        console.log(packageJson);
        jsonfile.writeFileSync('./package.json',packageJson,{spaces: 2, EOL: '\r\n'});
    }
}

function prepareElectronBuildCmd(args) {
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
}