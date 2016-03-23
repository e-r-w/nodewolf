'use strict';

const Game    = require('../../game');
const MockBot = require('../resources/mock-bot');
const assert  = require('assert');
const STATUS  = require('../../res/game-status');
const TURN  = require('../../res/turn');
const ROLE  = require('../../res/roles');

const alive   = require('../../handlers/alive');
const end     = require('../../handlers/end');
const guard   = require('../../handlers/guard');
let game, bot;

describe('handlers', function(){

  beforeEach( () => {
    game = new Game();
    bot  = new MockBot();
  });

  describe('Alive', function(){

    it('should show a list with all living players', () => {

      game.players = [
        {name: 'joel',   dead: true},
        {name: 'nick',   dead: false},
        {name: 'wolfy',  dead: false},
        {name: 'hailey', dead: false}
      ];

      game.status = STATUS.IN_PROGRESS;

      alive(bot, game, {pm:false});

      assert.equal(bot.channel[0], "\n    Players remaining: \n @nick, @wolfy, @hailey\n  ");
    });

  });

  describe('end', function(){

    it('should end an in progress game', () => {

      game.status = STATUS.IN_PROGRESS;

      end(bot, game, {pm:false});

      assert.equal(game.status, STATUS.IDLE);

    });

  });

  describe('guard', function(){

    it('only the bodyguard should be able to guard someone', () => {

      game.status  = STATUS.IN_PROGRESS;
      game.turn    = TURN.BODYGUARD;
      game.players = [
        { id: 'wolfy', name: 'wolfy', role: ROLE.COMPLEX_VILLAGER.BODYGUARD },
        { id: 'nick', name: 'nick', role: ROLE.STANDARD.VILLAGER }
      ];

      guard(bot, game, {text: '!guard <@nick>', user: 'wolfy', pm: true});

      assert(game.players[1].protected);

    });

  });


});