const chalk = require('chalk');
const clear       = require('clear');
const figlet      = require('figlet');
const menus = {

    default: `
    usage: ngxeu <command>

    commands:
        ${chalk.cyan('init')}\t\tinitializes github release related meta data

        ${chalk.cyan('build')}\t\tbuilds the electron app into windows/mac distributables.        

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
    build: `
    usage: ngxeu ${chalk.cyan('build')}${chalk.green(' <appName>')} <options>
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  should be the one given while ${chalk.blue('ngxeu init AppName')}
    
    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --mac, -m')}
         package the app using electron-builder as mac distributable, Only works on macOS.
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --win -w')}
        package the app using electron-builder as windows distributable.  

        ${chalk.green('[optional] ')}${chalk.cyan(' --default')}
        package the app using electron-builder default package json config\n\tfor default config info run ${chalk.blue('ngxeu build MyApp --show-default')}  

        ${chalk.green('[optional] ')}${chalk.cyan(' --show-default')}
        shows the default package json config. 
    `,        
//----------------------------------------------------------------// 
    config:`
    usage: ngxeu ${chalk.cyan('config')} <options>
    `,
//----------------------------------------------------------------//  
    publish: `
    usage: ngxeu ${chalk.cyan('publish')} <options>

    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --draft')}\t\t\tupload assets as draft version ${chalk.green('(default)')} 
        ${chalk.green('[optional] ')}${chalk.cyan(' --release')}\t\t\tupload assets as release version   
        ${chalk.green('[optional] ')}${chalk.cyan(' --name')}\t\t\trelease name ${chalk.green('(if not given will be defaulted to tag name)')} 
        ${chalk.green('[optional] ')}${chalk.cyan(' --target')}\t\t\tbranch name ${chalk.green('(if not given will be defaulted to master)')} 
        ${chalk.green('[optional] ')}${chalk.cyan(' --notes')}\t\t\tany notes ${chalk.green('(if not given will be defaulted to empty)')} 
        ${chalk.red('[mandatory]')}${chalk.cyan(' --tag,  -t ')}\t\t\trelease/draft tag version 
        ${chalk.red('[mandatory]')}${chalk.cyan(' --file, -f ')}\t\t\tfile(s) to be uploaded, should be the relative path of the files`,
//----------------------------------------------------------------// 
    releases: `
    usage: ngxeu ${chalk.cyan('releases')}${chalk.green(' <appName>')}  <options>
    
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  should be the one given while ${chalk.blue('ngxeu init AppName')}
    
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