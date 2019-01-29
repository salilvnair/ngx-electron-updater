const inquirer    = require('inquirer');
const fileutil    = require('./file.util');

module.exports = {
    askGithubCredentials: () => {
    const questions = [
        {
        name: 'username',
        type: 'input',
        message: 'Enter your Github username or e-mail address:',
        validate: function( value ) {
            if (value.length) {
            return true;
            } else {
            return 'Please enter your username or e-mail address.';
            }
        }
        },
        {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function(value) {
            if (value.length) {
            return true;
            } else {
            return 'Please enter your password.';
            }
        }
        }
    ];
    return inquirer.prompt(questions);
    },

    askRegeneratedToken: () => {
    const questions = [
        {
        name: 'token',
        type: 'input',
        message: 'Enter your new github token:',
        validate: function( value ) {
            if (value.length) {
            return true;
            } else {
            return 'Please enter your new regenerated token:.';
            }
        }
        }
    ];
    return inquirer.prompt(questions);
    },

    askRepoDetails: () => {
    const argv = require('minimist')(process.argv.slice(2));

    const questions = [
        {
            type: 'input',
            name: 'user',
            message: 'Enter the name of repository owner:',
            default: 'batman',
            validate: function( value ) {
                if (value.length) {
                return true;
                } else {
                return 'Please enter the name of repository owner.';
                }
            }
        },
        {
            type: 'input',
            name: 'repo',
            default: argv._[1] || null,
            message: 'Enter the name of repository:',
            validate: function( value ) {
                if (value.length) {
                return true;
                } else {
                return 'Please enter a name for the repository.';
                }
            }
        }
    ];
    return inquirer.prompt(questions);
    },

//   askIgnoreFiles: (filelist) => {
//     const questions = [
//       {
//         type: 'checkbox',
//         name: 'ignore',
//         message: 'Select the files and/or folders you wish to ignore:',
//         choices: filelist,
//         default: ['node_modules', 'bower_components']
//       }
//     ];
//     return inquirer.prompt(questions);
//   }

  askConfirmationQuestion: (message) => {
    const questions = [
      {
        type: 'confirm',
        name: 'question',
        message: message,
        default: true
      }
    ];
    return inquirer.prompt(questions);
  }

};