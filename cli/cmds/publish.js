const github = require('../util/github-inquirer.util');
const chalk = require('chalk');
const ghRelease = require('../util/gh-release.util')
const fs = require('fs');
const jsonFile = require('jsonfile');
const figlet = require('figlet');
const clear = require('clear');
module.exports = async (args, draft) => {
    try {
        let files;
        let tag;
        if(!args._[1]){
            console.log(chalk.red('\nError:App name is not specified please specify using command:')+' ngxeu publish '+chalk.cyan('MyApp'));
            process.exit();
        }
        let appName = args._[1];
        //console.log(args)        
        let releases = await getAllReleases(appName);
        if(args.d||args.delete||args.D){           
           if(args.t||args.tag) {
            tag = args.t || args.tag;            
            await processDeletePublishedVersion(appName,tag,args,releases);
            process.exit();
           }
           else if(args.tgs||args.tags){
            let tagsArgs = args.tgs || args.tags;
            var tags = [];
            tags = tagsArgs.split(",");
            for(i=0;i<tags.length;i++){
                let tag = tags[i];
                await processDeletePublishedVersion(appName,tag,args,releases);
            }
            process.exit();
           } 
           else if(args.emptyTags||args.etgs){
            await processDeleteEmptyTags(appName,args);
            process.exit();
           }
           else{
            console.log(chalk.red('\nError:Tag name is not specified to be deleted, please specify using command:')+' ngxeu publish MyApp'+chalk.cyan(' -d -t v1.0.0'));
            process.exit();
           }
        }
        if(args.f || args.files) {
            let fileArgs = args.f || args.files;
            files = [];
            files = fileArgs.split(",");
            //console.log(files);
        }
        else{
            console.log(chalk.red('\nError:file(s) path not mentioned please pass using command:')+' ngxeu publish MyApp'+chalk.cyan(' -f ./test.zip'));
            process.exit();
        }
        if(args.tag|| args.t) {
            tag = args.tag || args.t;
        }
        else{
            console.log(chalk.red('\nError:release/draft tag name is not mentioned please pass using command:')+' ngxeu publish MyApp'+chalk.cyan(' -t v1.0.0'));
            process.exit();
        }
        draft = true;
        if(args.release) {
            draft = false;
        }
        let target, notes;

        if(args.target) {
            target = args.target;
        }
        if(args.notes) {
            notes = args.notes;
        }
        processPublish(releases,tag, target, notes, files, draft,appName);
        
    } catch (err) {
      console.error(err)
    }
  }

  function processPublish(releases,tag, target, notes, files, draft,appName){
        let accessToken = github.getStoredGithubToken(appName);        
        if(!accessToken) {
           console.log(chalk.red('\nError:access token not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
           process.exit();
        }
        let repoDetails = github.getStoredRepoDetails(appName);
        if(!repoDetails){
            console.log(chalk.red('\nError:repository details not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
            process.exit();
        }
        //create app-release.json and add it to the files array
        let name;
        if(fs.existsSync('./app-release.json')){
            let appReleaseInfo = jsonFile.readFileSync('./app-release.json');
            name = appReleaseInfo.version;
        }
        else{
            console.log(chalk.red('\nError:app-release.json is missing please build this app using command: ')+chalk.cyan('ngxeu build '+appName)+' and then publish!');
            process.exit();
        }
        if(releaseVersionExist(releases,tag,name) && !draft){
            console.log(chalk.red('\nError:App with same version has been published already!, please use a different version to publish a new release.\nor delete this version using '+chalk.cyan('ngxeu publish '+appName+' -d -tag='+tag)));
            process.exit();
        }
        
        files.push('./app-release.json');     
        let figi = 'Publishing '+ appName+"-"+name;
        console.log(
            chalk.red(figlet.textSync(figi, { font:'Doom'}))
        );   
        ghRelease.uploadAsset(accessToken,repoDetails.user,repoDetails.repo,name,tag,target,notes,files,draft);
  }

  async function getAllReleases(appName) {
    let accessToken = github.getStoredGithubToken(appName);       
    if(!accessToken) {
       console.log(chalk.red('\nError:access token not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
       process.exit();
    }
    let repoDetails = github.getStoredRepoDetails(appName);
    if(!repoDetails){
        console.log(chalk.red('\nError:repository details not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
        process.exit();
    }
    return ghRelease.listRelease(accessToken,repoDetails.user,repoDetails.repo,"all")
  }

  async function processDeletePublishedVersion(appName,tag,args,releases){
    let accessToken = github.getStoredGithubToken(appName);       
    if(!accessToken) {
       console.log(chalk.red('\nError:access token not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
       process.exit();
    }
    let repoDetails = github.getStoredRepoDetails(appName);
    if(!repoDetails){
        console.log(chalk.red('\nError:repository details not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
        process.exit();
    }
    listCmd="all";
    let hasTag = validateReleasesByTag(releases,tag,args);
    if(hasTag){
        if(hasMultipleEntriesForTag(releases,tag)){
            if(args.D){
                let figi = 'Cleaning';
                console.log(
                    chalk.red(figlet.textSync(figi, { font:'Doom'}))
                );
                let releaseIds = getReleaseIds(releases,tag,args);
                await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,tag,releaseIds,null,args.target)
            }
            else{
                console.log(chalk.red('\nError:Multiple entries with tag name ')+chalk.cyan(tag)+' found.Please use '+chalk.cyan('-D')+' to force delete all. eg:'+chalk.cyan('ngxeu publish MyApp -D -t v1.0.0'));
                process.exit(); 
            }
        }
        else{
            let figi = 'Cleaning';
            console.log(
                chalk.red(figlet.textSync(figi, { font:'Doom'}))
            );
            let releaseIds = getReleaseIds(releases,tag,args);
            await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,tag,releaseIds,null,args.target)
        }  
    }
    else{
        let targetInfo = '';
        let targetInfoPrefix = ''
        if(args.target){
            targetInfoPrefix = 'on';
            targetInfo = args.target;
        }
        console.log(chalk.red('\nError('+chalk.cyan('404')+'): No tag name with ')+chalk.cyan(tag)+chalk.red(' found '+targetInfoPrefix)+chalk.cyan(' '+targetInfo));
    }
  }

  async function processDeleteEmptyTags(appName,args){
    let tagsArgs = args.etgs || args.emptyTags;
    let emptyTags = [];
    emptyTags = tagsArgs.split(",");
    let accessToken = github.getStoredGithubToken(appName);       
    if(!accessToken) {
       console.log(chalk.red('\nError:access token not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
       process.exit();
    }
    let repoDetails = github.getStoredRepoDetails(appName);
    if(!repoDetails){
        console.log(chalk.red('\nError:repository details not found please set one using command: ')+chalk.cyan('ngxeu init '+appName));
        process.exit();
    }
    listCmd="all";
    let figi = 'Cleaning';
    console.log(
        chalk.red(figlet.textSync(figi, { font:'Doom'}))
    );
    await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,null,null,emptyTags,null);
    process.exit();
  }

  function validateReleasesByTag(releases,tag,args) {
      let hasTag = false;
      releases.forEach(element => {
          if(args.target){
            if(element.tag_name===tag && element.target_commitish===args.target){
                hasTag = true;
              }
          }
          else{
            if(element.tag_name===tag){
                hasTag = true;
              }
          }
      });
      return hasTag;
  }

  function getReleaseIds(releases,tag,args){
    let releaseIds = [];
    releases.forEach(element => {
        if(args.target){
            if(element.tag_name===tag && element.target_commitish===args.target){
                releaseIds.push(element.id);
              }
          }
          else{
            if(element.tag_name===tag){
                releaseIds.push(element.id);
              }
          }
    });
    return releaseIds;
  }

  function hasMultipleEntriesForTag(releases,tag) {
    let hasMulitpleEntries = false;
    let counter = 0;
    releases.forEach(element => {
        if(element.tag_name===tag){
          counter++;
        }
    });
    if(counter>1){
        hasMulitpleEntries = true;
    }
    return hasMulitpleEntries;
  }

  function releaseVersionExist(releases,tag) {
    let versionExist = false;
    releases.forEach(element => {
        if(element.tag_name===tag && !element.draft){
            versionExist = true;
          }
    });
    return versionExist;
}

