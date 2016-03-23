const TURN = require('../res/turn');
const ROLE = require('../res/roles');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){
  if( (game.status === STATUS.IN_PROGRESS) && (game.turn === TURN.BODYGUARD) && msg.pm ){
    const player = game.getPlayer(msg);
    if (player && !player.dead && player.role === ROLE.COMPLEX_VILLAGER.BODYGUARD) {
      const match = msg.text.match(/^!guard\s(<@\S+>)/gi);
      if(match && match.length > 0) {
        const playerId = match[0].replace('!guard <@', '').replace('>', '');
        const target = game.getPlayer({user: playerId});
        if (target && !target.dead && target.id !== player.id) {
          game.guardPlayer(target);
        }
      }
    }
  }
};

