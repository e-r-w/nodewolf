'use strict';

const parseCommands = require('./command-parser').parse;
const commands      = require('./res/commands');
const messages      = require('./res/messages');
const ROLE          = require('./res/roles');
const TURN          = require('./res/turn');
const Game          = require('./game');
const help          = require('./handlers/help');
const newGame       = require('./handlers/new');
const join          = require('./handlers/join');
const start         = require('./handlers/start');
const end           = require('./handlers/end');
const see           = require('./handlers/see');
const alive         = require('./handlers/alive');
const dead          = require('./handlers/dead');
const vote          = require('./handlers/vote');
const kill          = require('./handlers/kill');

exports.run = function(token, channel){

  const Bot = require('./bot');
  const bot = new Bot(token, channel);

  return new Promise( resolve => {

    const game = new Game();

    bot.on('message', msg => {
      const command = parseCommands(msg);
      const validChannels = game.players.map( player => player.id ).concat([bot.channel, bot.id]);
      if(validChannels.indexOf(msg.channel) >= 0){
        switch(command){
          case commands.HELP:
            help(bot, game, msg);
            break;
          case commands.NEW_GAME:
            newGame(bot, game, msg);
            break;
          case commands.JOIN:
            join(bot, game, msg);
            break;
          case commands.START:
            start(bot, game, msg);
            break;
          case commands.END:
            end(bot, game, msg);
            break;
          case commands.SEE:
            see(bot, game, msg);
            break;
          case commands.ALIVE:
            alive(bot, game, msg);
            break;
          case commands.DEAD:
            dead(bot, game, msg);
            break;
          case commands.VOTE:
            vote(bot, game, msg);
            break;
          case commands.KILL:
            kill(bot, game, msg);
            break;
        }
      }
    });

    game.on('start', () => {
      game.players.forEach( player => {
        bot.userMessage(player.id, messages.yourRole(player));
      });
      const votingWolves = game._votingWolves();
      votingWolves.forEach( wolf => {
        if(votingWolves.length > 1){
          bot.userMessage(wolf.id, messages.werewolvesAre(votingWolves));
        }
        else {
          bot.userMessage(wolf.id, messages.onlyWolf);
        }
      });
    });

    game.on('vote:cast', () => {
      bot.channelMessage(messages.ballot(game));
    });

    game.on('tough', toughGuy => {
      bot.userMessage(toughGuy, messages.tough);
    });

    game.on('vote:end', targets => {
      if(targets.length === 1 && targets[0] === 'noone'){
        bot.channelMessage(messages.noLynch);
      }
      else {
        bot.channelMessage(messages.lynch(
          targets
            .filter( target => target !== 'noone' )
            .map( target => game.playerById(target) )
            .map( target => `${target.name} (${target.role})` )
            .join(', @')
        ));
      }
    });

    game.on('insomniac', (insomniac, player) => {
      bot.userMessage(insomniac, messages.insomniac(player));
    });

    game.on('count', (count, werewolfCount) => {
      bot.userMessage(count, messages.count(werewolfCount));
    });

    game.on('phase:seer:start', usr => {
      bot.userMessage(usr.id, messages.see);
    });

    game.on('phase:seer:end', (seer, target, side) => {
      bot.userMessage(seer.id, messages.seen(target.name, side));
    });

    game.on('phase:guard:start', bodyguard => {
      bot.userMessage(bodyguard, messages.guard);
    });

    game.on('phase:guard:end', (bodyguard, guarded) => {
      bot.userMessage(bodyguard, messages.guarded(guarded));
    });

    game.on('phase:day:start', () => {
      bot.channelMessage(messages.day(game));
    });

    game.on('phase:werewolf:start', () => {
      // ask the werewolves to kill someone
      game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
        bot.userMessage(player, messages.hunt);
      });
    });
    //
    game.on('kill:cast', () => {
      game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
        bot.userMessage(player, messages.kill(game));
      });
    });

    game.on('kill:end', player => {
      if(player){
        bot.channelMessage(messages.killed(player));
      }
      else {
        bot.channelMessage(messages.notKilled);
      }
    });

    game.on('end', winners => {
      bot.channelMessage(messages.win(game, winners));
    });

    game.on('beholder', (beholder, seer) => {
      bot.userMessage(beholder.id, messages.seerIs(seer.name));
    });

    game.on('minion', (minion, wolves) => {
      const werewolves = wolves
        .map( player => player.name)
        .join(', @');
      bot.userMessage(minion.id, messages.werewolvesAre(werewolves));
    });

    bot.start().then( () => resolve(game) )

  });

};