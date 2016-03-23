const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if(!msg.pm){
    if(game.status === STATUS.IN_LOBBY){
      const players = game
        .addPlayer({id: msg.user, name: bot.members.filter( member => member.id === msg.user)[0].name})
        .players
        .map( player => player.name )
        .join(', @');
      bot.channelMessage(`Current lobby: @${players}`);
    }
    else if(game.status === STATUS.IN_PROGRESS){
      bot.channelMessage(messages.gameInProgress);
    }
    else {
      bot.channelMessage(messages.gameNotInProgress);
    }
  }
};

