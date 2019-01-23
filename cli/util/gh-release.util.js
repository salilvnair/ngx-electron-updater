const chalk = require('chalk');
const Octokit = require('@octokit/rest');
const octokit = new Octokit();
const path = require("path");
const fs = require("fs");
const mime = require('mime-types');
module.exports = {
    uploadAsset: async (ghToken,owner, repo, tag, files, draft) => {
        let release;
        let prerelease = false;
        try {
            validateGHToken(ghToken);
            if(!draft){
                console.log(`${chalk.green('GetReleaseByTag')}: owner=${chalk.cyan(owner)}, repo=${chalk.cyan(repo)}, tag=${chalk.cyan(tag)}`);
                const res = await octokit.repos.getReleaseByTag({
                    owner: owner,
                    repo: repo,
                    tag: tag,
                });
                release = res.data;
            }
        } catch (err) {
            console.error(chalk.red("Error:"),err);
        }

        try {
            let draftOrReleaseText = chalk.green('Release ');
            if(draft) {
                draftOrReleaseText = chalk.yellow('Draft ');
            }
            if (!release) {
                console.log(`${draftOrReleaseText}: tag_name=${chalk.cyan(tag)}, name=${chalk.cyan(tag)}, draft=${chalk.cyan(!!draft)}, prerelease=${chalk.cyan(!!prerelease)}`);
                const res = await octokit.repos.createRelease({
                    owner,
                    repo,
                    tag_name: tag,
                    name: tag,
                    body:'',
                    draft: !!draft,
                    prerelease: !!prerelease,
                });
                release = res.data;
            } else {
                console.log(`${chalk.green('Updating ')+ draftOrReleaseText}: release_id=${chalk.cyan(release.id)}, tag_name=${chalk.cyan(tag)}`);
                const res = await octokit.repos.updateRelease({
                    owner,
                    repo,
                    release_id: release.id,
                    tag_name: tag,
                    body: '',
                    draft: false,
                    prerelease: false
                });
                release = res.data;
            }

            if (files.length > 0) {
                console.log(`${chalk.green('Uploading ')+draftOrReleaseText+' assets'}: assets_url=${chalk.cyan(release.assets_url)}`);
                for (let i = 0; i < files.length; ++i) {
                    const file = files[i];
                    console.log(`  #${chalk.cyan(i + 1)}: name="${chalk.cyan(path.basename(file))}" filePath="${chalk.cyan(file)}"`);
                    const res = await octokit.repos.uploadReleaseAsset({
                        url: release.upload_url,
                        file: fs.createReadStream(file),
                        headers: {
                            'Content-Type': mime.lookup(file) || 'application/octet-stream',
                            'Content-Length': fs.statSync(file).size,
                        },
                        name: path.basename(file),
                    });
                    console.log("res",res);
                }
            }
        } catch (err) {
            console.error(chalk.red("Error:"),err);
        }
    },

    listRelease: async(ghToken,owner, repo, listCmd) => {
        try {
            validateGHToken(ghToken);
            console.log(`${chalk.green('listing '+listCmd+' release where')}: owner=${chalk.cyan(owner)}, repo=${chalk.cyan(repo)}`);
            if(listCmd==='latest') {
                const res = await octokit.repos.getLatestRelease({
                    owner: owner,
                    repo: repo
                });
                return res.data; 
            }
            const res = await octokit.repos.listReleases({
                owner: owner,
                repo: repo
            });
            return res.data;
        } catch (err) {
            console.error(chalk.red("Error:"),err);
        }
    }
    
};
function validateGHToken(ghToken) {
    octokit.authenticate({
        type: 'oauth',
        token: ghToken
    });
}