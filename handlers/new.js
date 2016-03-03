const messages = require('../res/messages');
const STATUS = require('../res/game-status');

module.exports = function(bot, game, msg){

  if(game.status === STATUS.IDLE){
    game.addPlayer(msg);
    game.addPlayer({ user: 'U0ATDMJ0K' }); //wolfy
    game.addPlayer({ user: 'U0K9AV2BD' }); //rory
    bot.channelMessage(messages.newGame);
    bot.channelMessage(`Current lobby: @${game.playerList()}`);
    game.status = STATUS.IN_LOBBY;
  }
  else {
    bot.channelMessage(messages.gameInProgress);
  }

};

