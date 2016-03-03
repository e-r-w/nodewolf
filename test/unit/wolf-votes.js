'use strict';

const Game = require('../../game');
const ROLE = require('../../res/roles');
const WINNERS = require('../../res/winners');
const assert = require('assert');
let game;

describe('Wolf voting', function(){

  beforeEach( () => {
    game = new Game();
  });

  it('should declare the tanner winner if werewolves kill tanner', done => {

    game.players = [
      { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER},
      { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'jkl', role: ROLE.STANDARD.WEREWOLF},
      { name: 'nigel',  id: 'mno', role: ROLE.COMPLEX.TANNER},
      { name: 'ethan',  id: 'pqr', role: ROLE.COMPLEX.BODYGUARD}
    ];

    game.targets = [
      { candidate: game.players[4] , voters: ['rory']}
    ];

    game.on('won', winners => {
      assert.equal(winners, WINNERS.TANNER);
      done();
    });

    game.kill(game.players[3], game.players[4]);

  });

  it('should declare the werewolves winner if werewolves outnumber villagers', done => {

    game.players = [
      { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER, dead: true},
      { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'jkl', role: ROLE.STANDARD.WEREWOLF},
      { name: 'nigel',  id: 'mno', role: ROLE.COMPLEX.BEHOLDER},
      { name: 'ethan',  id: 'pqr', role: ROLE.COMPLEX.BODYGUARD}
    ];

    game.targets = [
      { candidate: game.players[4] , voters: ['rory']}
    ];

    game.on('won', winners => {
      assert.equal(winners, WINNERS.WEREWOLF);
      done();
    });

    game.kill(game.players[3], game.players[4]);

  });


});