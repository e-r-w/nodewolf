const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if(!msg.pm){
    if(game.status === STATUS.IDLE){
      bot.channelMessage(messages.newGame);
      const players = game
        .addPlayer({id: msg.user, name: bot.members.filter( member => member.id === msg.user)[0].name})
        .players
        .map( player => player.name )
        .join(', @');
      bot.channelMessage(`Current lobby: @${players}`);
      game.status = STATUS.IN_LOBBY;
    }
    else {
      bot.channelMessage(messages.gameInProgress);
    }
  }
};

