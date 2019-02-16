const fuseUtil = require('../util/fuse.util');
const chalk = require('chalk');
module.exports = async (args) => {
    if(!args._[1]){
        console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu create '+chalk.cyan('MyApp'));
        process.exit();
    }
    let appName = args._[1];
    if(args["inject-build-config"]||args.ibc){
        if(!processInjectingNgxeuInPackageJson(args, appName)){
            require('./help')(args);
            process.exit();
        }
    }
    else{
        if(!await processCreateNgElectronFusion(args, appName)){
            require('./help')(args);
            process.exit();
        }
    }
}

async function processCreateNgElectronFusion(args, appName) {    
   await fuseUtil.createAngularElectronApp(args,appName);
   return true;
}

function processInjectingNgxeuInPackageJson(args, appName) {    
    fuseUtil.injectingNgxeuInPackageJson(args,appName);
    return true;
}

