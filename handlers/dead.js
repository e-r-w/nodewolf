'use strict';

const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if(game.status === STATUS.IN_PROGRESS){
    const players = game
      .players
      .filter( player => player.dead )
      .map( player => player.name )
      .join(', @');
    bot.channelMessage(messages.dead(players));
  }
};

