const TURN = require('../res/turn');
const ROLE = require('../res/roles');

module.exports = function(bot, game, msg){
  if( (game.turn === TURN.DAY) && !msg.pm ){
    const player = game.getPlayer(msg);
    if (player && !player.dead) {
      const match = msg.text.match(/^!vote\s(<@\S+>)/gi);
      if(match && match.length > 0 && player.role !== ROLE.COMPLEX_VILLAGER.PACIFIST) {
        const playerId = match[0].replace('!vote <@', '').replace('>', '');
        const target = game.getPlayer({user: playerId});
        if (target && !target.dead) {
          game.vote(player.id, target.id);
        }
      }
      else {
        const noOne = msg.text.match(/^!vote\s(noone)/gi);
        const clear = msg.text.match(/^!vote\s(clear)/gi);
        if(clear && clear.length){
          game.removeVote(player.id);
        }
        else if(noOne && noOne.length){
          game.vote(player.id, 'noone');
        }
      }
    }
    else if(player){
      bot.channelMessage(`Quiet you, dead people can't vote`);
    }
  }
};

