const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
var pkg = require('../package.json')
const menus = {

    default: `
    usage: ngxeu ${chalk.cyan('<command>')}

    commands:
    
        ${chalk.cyan('init')}\t\tInitializes github release related meta data

        ${chalk.cyan('fuse')}\t\tCreates a fusion between angular and electron app.  

        ${chalk.cyan('build')}\t\tBuilds the electron app into windows/mac distributables.        

        ${chalk.cyan('publish')}\t\tPublishes the assests using the github release API v3

        ${chalk.cyan('show')}\t\tShows the list of releases for an app        
        
    for more help run ${chalk.cyan('ngxeu <command> -h')}  to get quick help on <command>
        `,
//----------------------------------------------------------------//
    init: `
    usage: ngxeu ${chalk.cyan('init')}${chalk.green(' <appName>')}  

    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  unique app name

    options:
        ${chalk.green('[optional] ')}${chalk.cyan('  --list, -l')}
         shows the list of stored app tokens and repo details.${chalk.bold.red('(The appName is not mandatory here and can be omitted.)')}
        
        ${chalk.green('[optional] ')}${chalk.cyan('  --clear, -c')}
         deletes the existing access token and repo details if any.
        
        ${chalk.green('[optional] ')}${chalk.cyan('  --clear-token, -ct')}
         deletes the existing access token if any.
        
        ${chalk.green('[optional] ')}${chalk.cyan('  --clear-repodetails, -cr')}
         deletes the existing repo details if any..
        
        `,      

//----------------------------------------------------------------//  
    build: `
    usage: ngxeu ${chalk.cyan('build')}${chalk.green(' <appName>')} <options>
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  should be the one given while ${chalk.blue('ngxeu init AppName')}
    
    options:      
        ${chalk.red('[mandatory]')}${chalk.cyan(' --type,  -t ')}
         type of build which will be performed, valid options are  ${chalk.blue('(angular|ng, electron|e)')}

        ${chalk.green('[optional] ')}${chalk.cyan(' --bump, -b')}
         used to bump the version of the app .(${chalk.green('defaulted to '+chalk.red('npm version major'))})   \n\t valid options are  ${chalk.blue('(major|minor|patch)')}

        ${chalk.green('[optional] ')}${chalk.cyan(' --skip-ng')}
         skip angular build if already done once,\n\t usually used when a new logo is placed in the build directory.

        ${chalk.green('[optional] ')}${chalk.cyan(' --pack, -p')}
         package the app using electron-builder and if pack version is specified \n\t then it will be used to build the app.

        ${chalk.green('[optional] ')}${chalk.cyan(' --icon, -i')}
         specify the location of icon file ${chalk.bold.underline.red('(name should be one of icon.png, icon.ico, icon.icns)')}

        ${chalk.green('[optional] ')}${chalk.cyan(' --default')}
         package the app using electron-builder default package json config.(${chalk.green('defaulted to '+chalk.red('--default'))})\n\t for default config info run ${chalk.blue('ngxeu build MyApp --show-default\n\t')} ${chalk.bold.underline.red('NOTE: The --type option is not mandatory here and can be omitted.')}

        ${chalk.green('[optional] ')}${chalk.cyan(' --debug')}
         start electron-builder in debug mode.

        ${chalk.green('[optional] ')}${chalk.cyan(' --no-default')}
         package the app using electron-builder user defined builder config.(${chalk.green('defaulted to '+chalk.red('--default'))})  

        ${chalk.green('[optional] ')}${chalk.cyan(' --show-default')}
         shows the default package json config. 
    `,        
//----------------------------------------------------------------// 
    config:`
    usage: ngxeu ${chalk.cyan('config')} <options>
    `,
//----------------------------------------------------------------//  

//----------------------------------------------------------------// 
    fuse:`
    usage: ngxeu ${chalk.cyan('fuse')}${chalk.green(' <appName>')} <options>
    
    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --skip-ng')}
         skip angular option can be used on an existing angular app. 

        ${chalk.green('[optional] ')}${chalk.cyan(' --skip-el')}
         skip electron installation.  

        ${chalk.green('[optional] ')}${chalk.cyan(' --ts')}${chalk.green(' (if not specified will be defaulted to js)')}
         use typescript for building electron app i.e. main.ts instead of main.js 
            
        ${chalk.green('[optional] ')}${chalk.cyan(' --inject-build-config --ibc')}
         this option is used to inject ngxeu build configs to an already installed angular app.     
    `,
//----------------------------------------------------------------// 
    publish: `
    usage: ngxeu ${chalk.cyan('publish')}${chalk.green(' <appName>')} <options>
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  should be the one given while ${chalk.blue('ngxeu init AppName')}
    

    options:
        ${chalk.red('[mandatory]')}${chalk.cyan(' --tag,  -t ')}
         release/draft tag version 
        
        ${chalk.red('[mandatory]')}${chalk.cyan(' --files, -f ')}
         file(s) to be uploaded, should be the relative path of the files

        ${chalk.green('[optional] ')}${chalk.cyan(' --draft')}
         upload assets as draft version ${chalk.green('(default)')} 

        ${chalk.green('[optional] ')}${chalk.cyan(' --release')}
         upload assets as release version

        ${chalk.green('[optional] ')}${chalk.cyan(' --target')}
         branch name (${chalk.green('defaulted to ')}${chalk.red('master')})
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --notes')}
         any notes or release change log (${chalk.green('defaulted to ')}${chalk.red('empty')})  
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --delete, -d, -D')}
         delete a draft,release or a tag by tag name(s) eg: ${chalk.green('ngxeu publish MyApp')} ${chalk.red('-D')} ${chalk.green('--tags=v1.0.0,v1.0.1')}
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --tags, --tgs')}
         delete draft or release functionality uses this option to determine the tag name(s)\n\t eg: ${chalk.green('ngxeu publish MyApp')} ${chalk.red('-D')} ${chalk.cyan(' --tags=v1.0.0,v1.0.1')}
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --emptyTags, --etgs')}
         delete tag functionality uses this option to determine the empty tag name(s)\n\t eg: ${chalk.green('ngxeu publish MyApp')} ${chalk.red('-D')} ${chalk.cyan(' --emptyTags=v1.0.0,v1.0.1')}
        `,
//----------------------------------------------------------------// 
    show: `
    usage: ngxeu ${chalk.cyan('show')}${chalk.green(' <appName>')}  <options>
    
    commands:
        ${chalk.red('[mandatory]')}${chalk.cyan('  appName')}  should be the one given while ${chalk.blue('ngxeu init AppName')}
    
    options:
        ${chalk.green('[optional] ')}${chalk.cyan(' --list, -l')}
         shows a list of all releases, only users with push access will receive listings for draft releases.
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --latest --list, --latest -l')}
         shows a response of latest release.  
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --out, -o ')}
         saves list of all releases to the given json file(expects relative file path), \n\t only users with push access will receive listings for draft releases.
        
        ${chalk.green('[optional] ')}${chalk.cyan(' --latest --out,  --latest -o ')}
         saves the response of latest release to the given json file(expects relative file path)` 
//----------------------------------------------------------------//                
  }
  
  
  module.exports = (args) => {
    clear();
    console.log(
        `${chalk.red(figlet.textSync('Ngx   Electron   Updater', { font:'Doom'}))}
CLI version : ${pkg.version}
Node version: ${process.version}
        `
      );
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
  
    console.log(menus[subCmd] || menus.default)
  }