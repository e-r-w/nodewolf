'use strict';

const Game = require('../../game');
const assert = require('assert');
const messages = require('../../res/messages');
const ROLE = require('../../res/roles');
let game;

describe('messages', function(){

  beforeEach( () => {
    game = new Game();
  });

  describe('gameStart', function(){

    it('should show a list with 3 players', () => {

      game.players = [
        {name: 'wolfy'},
        {name: 'nick'},
        {name: 'ethan'}
      ];

      assert.equal(messages.gameStart(game).replace(/\s+/g, ''), `
        A new game of Werewolf is starting! For a tutorial, type !help.

        Players: @wolfy, @nick, @ethan

        Roles: [Seer, Villager, Werewolf], Potential Roles: []

        :crescent_moon: :zzz: It is the middle of the night and the village is sleeping. The game will begin when the Seer chooses someone.
      `.replace(/\s+/g, ''));

    });

    it('should show a list with complex roles', () => {

      game.players = [
        {name: 'wolfy'},
        {name: 'josh'},
        {name: 'hailey'},
        {name: 'nigel'},
        {name: 'nick'},
        {name: 'ethan'}
      ];

      assert.equal(messages.gameStart(game).replace(/\s+/g, ''), `
        A new game of Werewolf is starting! For a tutorial, type !help.

        Players: @wolfy, @josh, @hailey, @nigel, @nick, @ethan

        Roles: [Seer, Villager, Werewolf], Potential Roles: [${Object.keys(ROLE.COMPLEX_VILLAGER).concat(Object.keys(ROLE.COMPLEX_WOLVES).join(', '))}]

        :crescent_moon: :zzz: It is the middle of the night and the village is sleeping. The game will begin when the Seer chooses someone.
      `.replace(/\s+/g, ''));

    });

  });

  it('werewolf kill vote', () => {

    game.players = [
      { name: 'wolfy', id: 'abc', role: ROLE.STANDARD.WEREWOLF },
      { name: 'ethan', id: 'def', role: ROLE.STANDARD.WEREWOLF },
      { name: 'nick',  id: 'ghi', role: ROLE.STANDARD.VILLAGER },
      { name: 'josh',  id: 'jkl', role: ROLE.STANDARD.SEER }
    ];

    game.targets = [
      { target: 'jkl', voters: ['abc', 'def']}
    ];

    assert.equal(messages.kill(game).replace(/\s+/g, ''), `
      :memo: Werewolf Kill Vote
      -----------------------------------------
      :knife: Kill @josh   | (2) | @wolfy, @ethan

      --------------------------------------------------------------
      :hourglass: Remaining Voters: None
      --------------------------------------------------------------
    `.replace(/\s+/g, ''));
  });


});