const chalk = require('chalk');
const clear       = require('clear');
const figlet      = require('figlet');
const menus = {

    default: `
    usage: ngxeu <command>

    commands:
        ${chalk.cyan('init')}\t\tinitializes github release related meta data

        ${chalk.cyan('publish')}\t\tpublishes the assests using the github release API v3

        ${chalk.cyan('releases')}\tshows the list of releases for an app        
        
    for more help run ${chalk.cyan('ngxeu <command> -h')}  to get quick help on <command>
        `,
//----------------------------------------------------------------//
    init: `
    usage: ngxeu ${chalk.cyan('init')}${chalk.green(' <appName>')}  

    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  prompts user to enter github token and repository details then saves it in config.`,
//----------------------------------------------------------------//  
    publish: `
    usage: ngxeu ${chalk.cyan('publish')} <options>

    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --draft')}\t\t\t\t\tupload assets as draft version ${chalk.green('(default)')} 
        ${chalk.green('[optional] ')}${chalk.cyan(' --release')}\t\t\t\t\tupload assets as release version   
        ${chalk.red('[mandatory]')}${chalk.cyan(' --tag, -t ')}${chalk.yellow('<tagName>')}\t\t\t\trelease/draft tag version 
        ${chalk.red('[mandatory]')}${chalk.cyan(' --file, -f ')}${chalk.yellow('<fileNameWithRelativePath>')}\tfile(s) to be uploaded`,
//----------------------------------------------------------------// 
    releases: `
    usage: ngxeu ${chalk.cyan('releases')}${chalk.green(' <appName>')}  <options>
    
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')} appName should be the one given while ngxeu init AppName
    
    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --list, -l')}
         shows a list of all releases, Only users with push access will receive listings for draft releases.
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --latest --list, --latest -l')}
         shows a response of latest release.  
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --out, -o ')}${chalk.yellow('<fileNameWithRelativePath>')}
         saves list of all releases to the given json file, Only users with push access will receive listings for draft releases.
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --latest --out,  --latest -o ')}${chalk.yellow('<fileNameWithRelativePath>')}
         saves the response of latest release to the given json file` 
//----------------------------------------------------------------//                
  }
  
  
  module.exports = (args) => {
    clear();
    console.log(
        chalk.red(
          figlet.textSync('Ngx   Electron   Updater', { font:'Doom',verticalLayout: 'full' })
        )
      );
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
  
    console.log(menus[subCmd] || menus.default)
  }