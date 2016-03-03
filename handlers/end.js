'use strict';

const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if(game.status === STATUS.IN_PROGRESS){
    bot.channelMessage(messages.endGame); // TODO make message take game state, calc victory
    game.end();
  }
  else if(game.status === STATUS.IN_LOBBY){
    bot.channelMessage(messages.lobbyClosed);
    game.end();
  }
  else {
    bot.channelMessage(messages.gameNotInProgress);
  }
};

