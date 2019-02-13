const fs = require('fs');
const ngxeuinclude = input => {
    return input.toString()
      .split(/\r?\n/)
      .filter(l => l.trim() !== '' && l.charAt(0) !== '#');
  };
  
  ngxeuinclude.parse = (path, fn = line => line) => {
    if(!fs.existsSync(path)){
        return null;
    }  
    let input = fs.readFileSync(path);  
    let lines = input.toString().split(/\r?\n/);
    let state = { patterns: [], sections: [] };
    let section = { name: 'default', patterns: [] };
  
    for (let line of lines) {
      if (line.charAt(0) === '#') {
        section = { name: line.slice(1).trim(), patterns: []};
        state.sections.push(section);
        continue;
      }
  
      if (line.trim() !== '') {
        let pattern = fn(line, section, state);
        section.patterns.push(pattern);
        state.patterns.push(pattern);
      }
    }
    return state;
  };
  
  ngxeuignore.format = (section) => {
    return `# ${section.name}\n${section.patterns.join('\n')}\n\n`;
  };
  
  ngxeuignore.stringify = (sections, fn = ngxeuignore.format) => {
    let result = '';
    for (let section of [].concat(sections)) result += fn(section);
    return result.trim();
  };
  
  module.exports = ngxeuignore;