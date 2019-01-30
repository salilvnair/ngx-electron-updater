const ProgressBar = require('progress')
const _cliProgress = require('cli-progress');
var Multiprogress = require("multi-progress");
const chalk = require('chalk');

 module.exports = (args) => {
     console.log('hmmmm.....')
      
// spawn an instance with the optional stream to write to
// use of `new` is optional
var multi = new Multiprogress(process.stderr);
 
// create a progress bar
var bar = multi.newBar('  downloading [:bar] :percent :etas', {
  complete: chalk.cyan('█'),
  incomplete: chalk.cyan('░'),
  width: 30,
  total: 100
});

var bar1 = multi.newBar('  downloading [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: 100
  });
    // const bar = new ProgressBar(':bar', { total: 100 })
    // const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    // const bar2 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

    // bar1.start(200, 0);
    // bar2.start(200, 0);
    let counter = 0;
    const timer = setInterval(() => {
      bar.tick()
      bar1.tick()
    //   if (counter==bar1.getTotal()) {
    //     clearInterval(timer)
    //     bar1.stop();
    //     bar2.stop();
    //   }
    //   counter = counter+10;
    //   bar1.update(counter);
    //   bar2.update(counter);
    if (bar.complete) {
        console.log('\ncomplete\n');
        clearInterval(timer);
      }
    }, 1000)

    // const timer1 = setInterval(() => {
    //     //bar.tick()
    //     if (counter==bar1.getTotal()) {
    //       clearInterval(timer1)
    //       bar1.stop();
    //       bar2.stop();
    //     }
    //     counter = counter+10;
    //     bar1.update(counter);
    //     bar2.update(counter);
    //   }, 100)
 }