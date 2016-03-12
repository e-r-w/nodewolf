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
      { name: 'wolfy',  id: 'wolfy', role: ROLE.STANDARD.SEER},
      { name: 'nick',   id: 'nick', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'rory', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'hailey', role: ROLE.STANDARD.WEREWOLF},
      { name: 'nigel',  id: 'nigel', role: ROLE.COMPLEX_VILLAGER.TANNER},
      { name: 'ethan',  id: 'ethan', role: ROLE.COMPLEX_VILLAGER.BODYGUARD}
    ];

    game.targets = [
      { target: game.players[4].id , voters: ['rory']}
    ];

    game.on('end', winners => {
      assert.equal(winners, WINNERS.TANNER);
      done();
    });

    game.kill(game.players[3].id, game.players[4].id);

  });

  it('should declare the werewolves winner if werewolves outnumber villagers', done => {

    game.players = [
      { name: 'wolfy',  id: 'wolfy', role: ROLE.STANDARD.SEER, dead: true},
      { name: 'nick',   id: 'nick', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'rory', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'hailey', role: ROLE.STANDARD.WEREWOLF},
      { name: 'nigel',  id: 'nigel', role: ROLE.COMPLEX_VILLAGER.BEHOLDER},
      { name: 'ethan',  id: 'ethan', role: ROLE.COMPLEX_VILLAGER.BODYGUARD}
    ];

    game.targets = [
      { target: game.players[4].id , voters: ['rory']}
    ];

    game.on('end', winners => {
      assert.equal(winners, WINNERS.WEREWOLF);
      done();
    });

    game.kill(game.players[3].id, game.players[4].id);

  });


});