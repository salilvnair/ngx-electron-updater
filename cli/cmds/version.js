const { version } = require('../package.json')
const chalk = require('chalk');
const figlet = require('figlet');
module.exports = (args) => {
  console.log(chalk.red(figlet.textSync(`${version}`, { font:'Larry 3D'})));
}