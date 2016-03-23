const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if(!msg.pm){
    if(game.status === STATUS.IN_PROGRESS){
      bot.channelMessage(messages.gameInProgress);
    }
    else if(game.status === STATUS.IDLE){
      bot.channelMessage(messages.gameNotInProgress);
    }
    else if(game.players.length < 3){
      bot.channelMessage(messages.morePlayersRequired);
    }
    else {
      game.start();
      bot.channelMessage(messages.gameStart(game));
    }
  }
};

