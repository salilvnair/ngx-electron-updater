const chalk = require('chalk');
const shellJs = require('shelljs');

 module.exports = (args) => {
     console.log('hmmmm.....'+args._[1]);
     let runElectronBuild = "git show-branch remotes/origin/"+args._[1];
     console.log(shellJs.exec(runElectronBuild).code);
 }