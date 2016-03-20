const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){

  if(game.status === STATUS.IDLE){
    game.addPlayer(msg);
    bot.channelMessage(messages.newGame);
    const players = game
      .addPlayer(msg)
      .map( player => player.name )
      .join(', @');
    bot.channelMessage(`Current lobby: @${players}`);
    game.status = STATUS.IN_LOBBY;
  }
  else {
    bot.channelMessage(messages.gameInProgress);
  }

};

