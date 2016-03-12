const messages = require('../res/messages');
const TURN = require('../res/turn');

module.exports = function(bot, game, msg){
  if(game.turn === TURN.WEREWOLF){
    const player = game.getPlayer(msg);
    // can't vote for a werewolf

    if (player && !player.dead && game._votingWolves().some(wolf => wolf.id === msg.user)) {
      const match = msg.text.match(/^!kill\s(<@\S+>)/gi);
      const clear = msg.text.match(/^!kill\s(clear)/gi);
      if(match && match.length > 0) {
        const playerId = match[0].replace('!kill <@', '').replace('>', '');
        const target = game.getPlayer({user: playerId});
        if (target && !target.dead && !game._votingWolves().some(wolf => wolf.id === target.id)) {
          game.kill(player.id, target.id);
          game._votingWolves().forEach( wolf => {
            bot.channelMessage(wolf, messages.kill(game));
          });
        }
      }
      else if(clear && clear.length){
        game.removeKill(player.id);
        game._votingWolves().forEach( wolf => {
          bot.channelMessage(wolf, messages.kill(game));
        });
      }
    }
  }
};

