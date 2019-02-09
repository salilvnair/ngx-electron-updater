const github = require('../util/github-inquirer.util');
const chalk = require('chalk');
const ghRelease = require('../util/gh-release.util')
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
        if(args.d||args.delete||args.D){
           if(args.t||args.tag) {
            tag = args.t || args.tag;
            await processDeletePublishedVersion(appName,tag,args);
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
        if(args.f || args.file) {
            let fileArgs = args.f || args.file;
            files = [];
            files = fileArgs.split(",");
            //console.log(files);
        }
        else{
            console.log(chalk.red('\nError:file(s) path not mentioned please pass using command:')+' ngxeu publish MyApp'+chalk.cyan(' -f ./test.zip'));
            process.exit();
        }
        if(args.t || args.tag) {
            tag = args.t || args.tag;
            //console.log(tag);
        }
        else{
            console.log(chalk.red('\nError:release/draft tag name is not mentioned please pass using command:')+' ngxeu publish MyApp'+chalk.cyan(' -t v1.0.0'));
            process.exit();
        }
        draft = true;
        if(args.release) {
            draft = false;
        }
        let name,target, notes;
        
        if(args.name) {
            name = args.name;
        }
        if(args.target) {
            target = args.target;
        }
        if(args.notes) {
            notes = args.notes;
        }
        processPublish(name, tag, target, notes, files, draft,appName);
        
    } catch (err) {
      console.error(err)
    }
  }

  function processPublish(name, tag, target, notes, files, draft,appName){
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
        files.push('./app-release.json');        
        ghRelease.uploadAsset(accessToken,repoDetails.user,repoDetails.repo,name,tag,target,notes,files,draft);
  }

  async function processDeletePublishedVersion(appName,tag,args){
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
    let releases = await ghRelease.listRelease(accessToken,repoDetails.user,repoDetails.repo,listCmd);
    let hasTag = validateReleasesByTag(releases,tag);
    if(hasTag){
        if(hasMultipleEntriesForTag(releases,tag)){
            if(args.D){
                let releaseIds = getReleaseIds(releases,tag);
                await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,tag,releaseIds,null)
            }
            else{
                console.log(chalk.red('\nError:Multiple entries with tag name ')+chalk.cyan(tag)+' found.Please use '+chalk.cyan('-D')+' to force delete all. eg:'+chalk.cyan('ngxeu publish MyApp -D -t v1.0.0'));
                process.exit(); 
            }
        }
        else{
            let releaseIds = getReleaseIds(releases,tag);
            await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,tag,releaseIds,null)
        }  
    }
    else{
        console.log(chalk.red('\nError('+chalk.cyan('404')+'): No tag name with ')+chalk.cyan(tag)+chalk.red(' found.'));
        process.exit();
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
    await ghRelease.deleteReleaseByTag(accessToken,repoDetails.user,repoDetails.repo,null,null,emptyTags);
    process.exit();
  }

  function validateReleasesByTag(releases,tag) {
      let hasTag = false;
      releases.forEach(element => {
          if(element.tag_name===tag){
            hasTag = true;
          }
      });
      return hasTag;
  }

  function getReleaseIds(releases,tag){
    let releaseIds = [];
    releases.forEach(element => {
        if(element.tag_name===tag){
            releaseIds.push(element.id);
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

