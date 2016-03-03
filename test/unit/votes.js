'use strict';

const Game = require('../../game');
const ROLE = require('../../res/roles');
const WINNERS = require('../../res/winners');
const assert = require('assert');
let game;

describe('Voting', function(){

  beforeEach( () => {
    game = new Game();
  });

  it('should select player with the highest votes', () => {
     game.votes = [
       { candidate: 'wolfy' , voters: ['ethan']},
       { candidate: 'ethan' , voters: ['wolfy', 'nick']}
     ];

    const voted = game.getVoted();
    assert.deepEqual(voted[0], 'ethan');
    assert.equal(voted.length, 1);
  });

  it('should select player with the highest votes again', () => {
    game.votes = [
      { candidate: 'wolfy' , voters: ['ethan']},
      { candidate: 'ethan' , voters: ['wolfy', 'nick', 'rory']},
      { candidate: 'rory'  , voters: ['hailey']}
    ];

    const voted = game.getVoted();
    assert.deepEqual(voted[0], 'ethan');
    assert.equal(voted.length, 1);
  });

  it('should select a tie', () => {

    game.votes = [
      { candidate: 'wolfy' , voters: ['ethan']},
      { candidate: 'ethan' , voters: ['wolfy', 'rory']},
      { candidate: 'rory'  , voters: ['hailey', 'nick']}
    ];

    const voted = game.getVoted();
    assert.deepEqual(voted[0], 'ethan');
    assert.deepEqual(voted[1], 'rory');
    assert.equal(voted.length, 2);
  });

  it('should remove votes', () => {
    game.votes = [
      { candidate: {name:'wolfy'} , voters: ['ethan']}
    ];

    game.vote({name:'ethan'}, {name: 'nick'});
    assert.deepEqual(game.votes[0], { candidate: {name:'nick'} , voters: ['ethan']});
    assert.equal(game.votes.length, 1);
  });

  it('should declare a winner if tanner is voted for', done => {

    game.players = [
      { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER},
      { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'jkl', role: ROLE.COMPLEX.TANNER},
      { name: 'nigel',  id: 'mno', role: ROLE.COMPLEX.BEHOLDER},
      { name: 'ethan',  id: 'pqr', role: ROLE.COMPLEX.BODYGUARD}
    ];

    game.votes = [
      { candidate: game.players[3] , voters: ['ethan','wolfy','nick','hailey','nigel']}
    ];

    game.on('won', winners => {
      assert.equal(winners, WINNERS.TANNER);
      done();
    });

    game.vote(game.players[2], game.players[3]);

  });

  it('should declare a winner if last werewolf is voted for', done => {
    game.players = [
      { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER},
      { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'jkl', role: ROLE.COMPLEX.WEREWOLF, dead: true}
    ];

    game.votes = [
      { candidate: game.players[2] , voters: ['wolfy','rory']}
    ];

    game.on('won', winners => {
      assert.equal(winners, WINNERS.VILLAGER);
      done();
    });

    game.vote(game.players[0], game.players[2]);

  });

  it('should declare a winner if villagers are outnumbered', done => {

    game.players = [
      { name: 'wolfy',  id: 'abc', role: ROLE.STANDARD.SEER, dead: true},
      { name: 'nick',   id: 'def', role: ROLE.STANDARD.VILLAGER},
      { name: 'rory',   id: 'ghi', role: ROLE.STANDARD.WEREWOLF},
      { name: 'hailey', id: 'jkl', role: ROLE.STANDARD.WEREWOLF},
      { name: 'nigel',  id: 'mno', role: ROLE.COMPLEX.BEHOLDER},
      { name: 'ethan',  id: 'pqr', role: ROLE.COMPLEX.BODYGUARD}
    ];

    game.votes = [
      { candidate: game.players[1] , voters: ['rory','nick','hailey','nigel']}
    ];

    game.on('won', winners => {
      assert.equal(winners, WINNERS.WEREWOLF);
      done();
    });

    game.vote(game.players[5], game.players[1]);

  });


});