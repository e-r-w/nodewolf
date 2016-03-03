'use strict';

const Game = require('../../game');
const ROLE = require('../../res/roles');
const WINNERS = require('../../res/winners');
const assert = require('assert');
let game;

describe('Game completion', function(){

  beforeEach( () => {
    game = new Game();
  });

  it('should declare tanner the winner', () => {
     game.players = [
       { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER},
       { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
       { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
       { name: 'hailey', id: 'jkl', role: ROLE.COMPLEX.TANNER, dead: true},
       { name: 'nigel',  id: 'mno', role: ROLE.COMPLEX.BEHOLDER},
       { name: 'ethan',  id: 'pqr', role: ROLE.COMPLEX.BODYGUARD}
     ];

    const winners = game.isOver();
    assert.equal(winners, WINNERS.TANNER);
  });

});