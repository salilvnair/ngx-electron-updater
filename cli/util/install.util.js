const inquirer = require('./inquirer.util');
const chalk = require('chalk');
const shellJs = require('shelljs');
const fs = require('fs');
const clear = require('clear');
const figlet = require('figlet');
var path = require('path');
const jsonfile = require('jsonfile');

module.exports =  {

    basicInstallation: async (args) =>{
        clear();
        await processBasicInstallation(args);
    },
    advancedInstallation: async (args) =>{
        clear();
        await processAdvancedInstallation(args);
    }
}

function processBasicInstallation(args){
    console.log(
        chalk.green("Installing @ngxeu/core  and its dependencies")
    );
    let intallationCmd = "npm install @ngxeu/core";
    shellJs.exec(intallationCmd);
    intallationCmd = "npm install ngx-electron follow-redirects fs-extra jsonfile unzipper";
    shellJs.exec(intallationCmd);
}

function processAdvancedInstallation(args){
    console.log(
        chalk.green("Installing @ngxeu/core  and its dependencies")
    );
    let intallationCmd = "npm install ngx-electron @ngxeu/core";
    shellJs.exec(intallationCmd);
    intallationCmd = "npm install --save-dev @ngxeu/util follow-redirects fs-extra jsonfile unzipper";
    shellJs.exec(intallationCmd);
    console.log(
        chalk.green("\n Installing @ngxeu/notifier and its dependencies")
    );
    intallationCmd = "npm install @ngxeu/notifier";
    shellJs.exec(intallationCmd);
    if(!args["skip-mat"]){
        intallationCmd = "ng add @angular/material";
        shellJs.exec(intallationCmd);
    }
    intallationCmd = "npm install -g electron";
    shellJs.exec(intallationCmd);
    intallationCmd = "npm install -g electron-builder";
    shellJs.exec(intallationCmd);
}