const messages = require('../res/messages');
const STATUS = require('../res/game-status');


module.exports = function(bot, game, msg){

  if(game.status === STATUS.IN_LOBBY){
    const players = game
      .addPlayer(msg)
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

};

