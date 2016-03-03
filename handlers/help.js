const messages = require('../res/messages');

module.exports = function(bot, game, msg){
  bot.userMessage(msg.user, messages.help);
};

