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

exports.run = function(token, channel, id){

  const Bot = require('./bot');
  const bot = new Bot(token, channel, id);

  return Promise.all([
    bot.start(),
    new Promise( (resolve, reject) => {
      bot.getUsers().then( data => {

        const game = new Game(data.members);

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
              const werewolves = votingWolves
                .map( player => player.name)
                .join(', @');
              bot.userMessage(wolf.id, messages.werewolvesAre(werewolves));
            }
            else {
              bot.userMessage(wolf.id, messages.onlyWolf);
            }
          });
        });

        game.on('tough', toughGuy => {
          bot.userMessage(toughGuy, messages.tough);
        });

        game.on('voted', targets => {
          // show dead
          bot.channelMessage(messages.lynch(
            targets.map( target => `${target.name} (${target.role})` ).join(', @')
          ));

        });

        game.on('insomniac', insomniac => {
          bot.userMessage(insomniac, messages.insomniac(game));
        });

        game.on('see', usr => {
          bot.userMessage(usr.id, messages.see);
        });

        game.once('seen', () => {
          game.day();
          game.startInsomniac();
          game.on('seen', () => {
            if(game.turn === TURN.BODYGUARD){
              game.guard();
            }
            else {
              game.hunt();
            }
          });
        });

        game.on('guard', bodyguard => {
          bot.userMessage(bodyguard, messages.guard);
        });

        game.on('day', () => {
          bot.channelMessage(messages.day(game));
        });

        game.on('hunt', () => {
          // ask the werewolves to kill someone
          game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
            bot.userMessage(player, messages.hunt);
          });
        });

        game.on('kill', () => {
          game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
            bot.userMessage(player, messages.kill(game));
          });
        });

        game.on('notKilled', () => {
          bot.channelMessage(messages.notKilled);
        });

        game.on('killed', player => {
          bot.channelMessage(messages.killed(player));
        });

        game.on('won', winners => {
          bot.channelMessage(messages.win(game, winners));
        });

        game.on('beholder', beholder => {
          const seer = game.getPlayersWithRole(ROLE.STANDARD.SEER);
          bot.userMessage(beholder.id, messages.seerIs(seer.name));
        });

        game.on('minion', minion => {
          const werewolves = game.getPlayersWithRole(ROLE.STANDARD.WEREWOLF)
            .map( player => player.name)
            .join(', @');
          bot.userMessage(minion.id, messages.werewolvesAre(werewolves));
        });

        resolve();

      }, reject);
    })
  ]);

};