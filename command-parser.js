const commands = require('./res/commands');

exports.parse = function(msg) {

  if(msg.text){
    const parseds = msg.text.match(/^(!)(\S*)/gi);
    const parsed = parseds ? parseds[0] : null;
    if(parsed){
      const command = commands[Object.keys(commands).filter( cmd => commands[cmd] === parsed )[0]];
      if(command) {
        return command;
      }
    }
  }


  return 'ERR_UNKNOWN';

};