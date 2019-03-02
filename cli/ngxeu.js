#!/usr/bin/env node
 const chalk = require('chalk');
 const minimist = require('minimist')
 module.exports = () => {

  // if (!fileutil.directoryExists('.git')) {
  //   console.log(chalk.red('Not a git repository!'));
  //   process.exit();
  // }

   const args = minimist(process.argv.slice(2))
   let cmd = args._[0] || 'help'

  if (args.version || args.v) {
     cmd = 'version'
  }

  if (args.help || args.h) {
    cmd = 'help'
  }

  switch (cmd) {
      case 'init':
        require('./cmds/init')(args)
      break

      case 'version':
        require('./cmds/version')(args)
      break
 
      case 'help':
        require('./cmds/help')(args)
      break

      case 'publish':
        require('./cmds/publish')(args,false)
      break     

      case 'show':
      require('./cmds/show')(args)
      break  

      case 'build':
      require('./cmds/build')(args)
      break 

      case 'fuse':
      require('./cmds/fuse')(args)
      break

      case 'install':
      require('./cmds/install')(args)
      break
      
      case 'test':
      require('./cmds/test')(args)
      break 

      default:
         console.error(`${chalk.red(chalk.cyan("\""+cmd+"\"")+" is not a valid command!")}`)
      break
  }
 }