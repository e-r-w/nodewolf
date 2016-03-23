'use strict';

const messages = require('../res/messages');
const ROLE = require('../res/roles');
const TURN = require('../res/turn');

module.exports = function(bot, game, msg){
  if(msg.pm){
    const player = game.getPlayer(msg);
    if(player && player.role === ROLE.STANDARD.SEER && game.turn === TURN.SEER){ // check if ok to seer
      const match = msg.text.match(/^!see\s(<@\S+>)/gi);
      if(match && match.length > 0){
        const playerId = match[0].replace('!see <@', '').replace('>', '');
        const target = game.getPlayer({user: playerId});
        if(target && !target.dead){
          game.see(target.id);
        }
        else {
          bot.userMessage(msg.user, messages.invalidSee);
        }
      }
      else {
        bot.userMessage(msg.user, messages.invalidSee);
      }
    }
  }
};

