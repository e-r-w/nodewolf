'use strict';

const Game = require('../../game');
const ROLE = require('../../res/roles');
const WINNERS = require('../../res/winners');
const assert = require('assert');
let game;

describe('Full game', function(){

  beforeEach( () => {
    game = new Game();
  });

  it('should run to completion', done => {

    const promises = [];

    // Add wolfy to game
    promises.push(new Promise( resolve => {
      game.once('add:player', player => {
        assert.deepEqual(player, { name: 'wolfy',  id: 'abc'});
        resolve();
      });
      game.addPlayer({ name: 'wolfy',  id: 'abc'});
    }));

    // Add nick to game
    promises.push(new Promise( resolve => {
      game.once('add:player', player => {
        assert.deepEqual(player, { name: 'nick',   id: 'def'});
        resolve();
      });
      game.addPlayer({ name: 'nick',   id: 'def'});
    }));

    // Add rory to game
    promises.push(new Promise( resolve => {
      game.once('add:player', player => {
        assert.deepEqual(player, { name: 'rory',   id: 'ghi'});
        resolve();
      });
      game.addPlayer({ name: 'rory',   id: 'ghi'});
    }));

    // Start the game
    promises.push(new Promise( resolve => {
      Promise.all([
        new Promise( res => {
          game.once('start', () => {
            game.players.forEach( player => {
              assert(player.role, 'All players should have roles');
              assert(!player.dead, 'All players should start out alive');
            });
            res();
          });
        }),
        new Promise( res => {
          game.once('phase:seer:start', seer => {
            assert(seer, 'Game must start with seer');
            res();
          });
        })
      ])
        .then(resolve);
      game.start();
    }));

    // The seer chooses someone to see, is told who they are
    promises.push(new Promise( resolve => {
      Promise.all([
          // After the seer has chosen, the player should be notified
          new Promise( res => {
            game.once('phase:seer:end', (seer, target, side) => {
              assert.notDeepEqual(seer, target, 'Seer cannot see themselves');
              assert(!target.dead, 'Seer cannot see dead people');
              assert(side, 'side should be shown to seer');
              assert(['Werewolves','Villagers'].indexOf(side) >= 0, 'Team should be one of Werewolves|Villagers');
              res();
            });
          }),
          // The game should also change to the seer phase
          new Promise( res => {
            game.once('phase:day:start', () => {
              res();
            });
          })
        ])
        .then(resolve);
      const seer = game._seer();
      game.see(seer.id === 'ghi' ? 'def' : 'ghi');
    }));

    // Rory votes for wolfy
    promises.push(new Promise( resolve => {
      game.once('vote:cast', (player, target, votes) => {
        assert.equal(votes.length, 1, 'should only be one vote so far');
        assert.equal(votes[0].target, 'abc');
        assert.equal(votes[0].voters[0], 'ghi');
        resolve();
      });
      game.vote('ghi', 'abc');
    }));

    // Rory changes his vote to nick
    promises.push(new Promise( resolve => {
      game.once('vote:cast', (player, target, votes) => {
        assert.equal(votes.length, 1, 'Should only be one vote so far');
        assert.equal(votes[0].target, 'def');
        assert.equal(votes[0].voters[0], 'ghi');
        resolve();
      });
      game.vote('ghi', 'def');
    }));

    // Wolfy votes for nick
    promises.push(new Promise( resolve => {
      game.once('vote:cast', (player, target, votes) => {
        assert(votes.length, 1, 'Should only be one vote so far');
        assert.equal(votes[0].target, 'def');
        assert.equal(votes[0].voters[0], 'ghi');
        assert.equal(votes[0].voters[1], 'abc');
        resolve();
      });
      game.vote('abc', 'def');
    }));

    // Nick votes for noone
    promises.push(new Promise( resolve => {
      Promise.all([
          // Nicks vote should show one 'noone' vote
          new Promise( res => {
            game.once('vote:cast', (player, target, votes) => {
              assert(votes.length, 2, 'Should be two votes');
              assert.equal(votes[0].target, 'def');
              assert.equal(votes[0].voters[0], 'ghi');
              assert.equal(votes[0].voters[1], 'abc');

              assert.equal(votes[1].target, 'noone');
              assert.equal(votes[1].voters[0], 'def');
              res();
            });
          }),
          // Should show lynching nick
          new Promise( res => {
            game.once('vote:end', deadPlayers => {
              assert(deadPlayers);
              assert.equal(deadPlayers.length, 1, 'should only be lynching one person');
              assert.equal(deadPlayers[0], 'def' , 'nick should be the one lynched');
              const nick = game.players.filter( player => player.id === 'def')[0];
              assert(nick.dead);
              res();
            });
          }),
          // The game should end
          new Promise( res => {
            game.once('end', winners => {
              assert(winners);
              const expected = game.players.some( player => player.role === ROLE.STANDARD.WEREWOLF && !player.dead)
                ? WINNERS.WEREWOLF
                : WINNERS.VILLAGER;
              assert.equal(winners, expected, `Expected winners to be ${expected} but was ${winners}`);
              assert(game.players.some( player => player.name === 'wolfy' ));
              assert(game.players.some( player => player.name === 'nick' ));
              assert(game.players.some( player => player.name === 'rory' ));
              assert(game.players.some( player => player.dead ));
              res();
            });
          })
        ])
        .then(resolve);
      game.vote('def', 'noone');
    }));

    Promise.all(promises)
      .then( () => {
        done();
      })
      .catch( err => done(err));

  });

  it('should run to completion - simple', done => {

    game.once('end', winners => {
      assert(winners);
      const expected = game.players.some( player => player.role === ROLE.STANDARD.WEREWOLF && !player.dead)
        ? WINNERS.WEREWOLF
        : WINNERS.VILLAGER;
      assert.equal(winners, expected, `Expected winners to be ${expected} but was ${winners}`);
      done();
    });

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.start();

    const seer = game._seer();
    game.see(seer.id === 'ghi' ? 'def' : 'ghi');

    // Rory votes for wolfy
    game.vote('ghi', 'abc');

    // Rory changes his vote to nick
    game.vote('ghi', 'def');

    // Wolfy votes for nick
    game.vote('abc', 'def');

    // Nick votes for noone - ends the game
    game.vote('def', 'noone');

  });

  it('should run to completion - 4 players', done => {

    game.once('end', winners => {
      assert.equal(winners, WINNERS.WEREWOLF);
      done();
    });

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.start();

    // re-assign roles so we can test better
    game.players[0].role = ROLE.STANDARD.WEREWOLF; // wolfy is only werewolf
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[3].role = ROLE.STANDARD.VILLAGER;

    game.see('ghi'); // nick sees a villager

    // Rory votes for josh
    game.vote('ghi', 'jkl');

    // Wolfy votes for josh
    game.vote('abc', 'jkl');

    // Nick votes for josh
    game.vote('def', 'jkl');

    // josh votes for noone - ends vote
    game.vote('jkl', 'noone');

    // nick sees his impending dooooooom
    game.see('abc');

    // wolfy votes to kill nick - this ends the game
    game.kill('abc', 'def');

  });

  it('should run to completion - 6 players, two WW', done => {

    Promise.all([
      new Promise( resolve => {
        game.once('vote:end', lynched => {
          assert.equal(lynched[0], 'jkl', 'Expected josh to be lynched');
          resolve();
        });
      }),
      new Promise( resolve => {
        game.once('kill:end', player => {
          assert.equal(player.id, 'def', 'Expected nick to be killed by werewolves');
          resolve();
        });
      }),
      new Promise( resolve => {
        game.once('end', winners => {
          assert.equal(winners, WINNERS.WEREWOLF);
          resolve();
        });
      })
    ])
      .then( () => done() )
      .catch( err=> done(err) );

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.addPlayer({ name: 'ethan',  id: 'mno'});
    game.addPlayer({ name: 'nigel',  id: 'pqr'});
    game.start();

    // re-assign roles so we can test better
    game.players[0].role = ROLE.STANDARD.WEREWOLF; // wolfy is werewolf
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.STANDARD.WEREWOLF; // rory is other ww
    game.players[3].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    game.see('jkl'); // nick sees a villager

    // Rory votes for josh
    game.vote('ghi', 'jkl');

    // Wolfy votes for josh
    game.vote('abc', 'jkl');

    // Nick votes for josh
    game.vote('def', 'jkl');

    // Ethan votes for josh
    game.vote('mno', 'jkl');

    // Nigel votes for josh
    game.vote('pqr', 'jkl');

    // josh votes for noone - ends vote
    game.vote('jkl', 'noone');

    // nick sees wolfy as a ww
    game.see('abc');

    // wolfy votes to kill nigel
    game.kill('abc', 'pqr');

    // rory votes to kill ethan
    game.kill('ghi', 'mno');

    // After some deliberation, they both decide to kill nick???
    game.kill('abc', 'def');
    game.kill('ghi', 'def');

    // BOOM end of game
  });

  it('beholder', done => {

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.addPlayer({ name: 'ethan',  id: 'mno'});
    game.addPlayer({ name: 'nigel',  id: 'pqr'});

    // assign roles manually
    game.players[0].role = ROLE.STANDARD.WEREWOLF; // wolfy is werewolf
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.STANDARD.WEREWOLF; // rory is other ww
    game.players[3].role = ROLE.COMPLEX_VILLAGER.BEHOLDER; // josh is beholder
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    game.once('beholder', (beholder, seer) => {
      assert.deepEqual(beholder, game.players[3]);
      assert.deepEqual(seer, game.players[1]);
      done();
    });

    game._start();

  });

  it('minion', done => {

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.addPlayer({ name: 'ethan',  id: 'mno'});
    game.addPlayer({ name: 'nigel',  id: 'pqr'});

    // assign roles manually
    game.players[0].role = ROLE.STANDARD.WEREWOLF; // wolfy is werewolf
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.COMPLEX_WOLVES.WOLFMAN; // rory is other ww
    game.players[3].role = ROLE.COMPLEX_WOLVES.MINION; // josh is minion
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    game.once('minion', (minion, werewolves) => {
      assert.deepEqual(minion, game.players[3]);
      assert.deepEqual([ game.players[0], game.players[2] ], werewolves);
      done();
    });

    game._start();

  });

  it('lynching the tanner ends the game', done => {

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.addPlayer({ name: 'ethan',  id: 'mno'});
    game.addPlayer({ name: 'nigel',  id: 'pqr'});

    // assign roles manually
    game.players[0].role = ROLE.COMPLEX_VILLAGER.TANNER; // wolfy is tanner
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.COMPLEX_WOLVES.WOLFMAN; // rory is other ww
    game.players[3].role = ROLE.COMPLEX_WOLVES.MINION; // josh is beholder
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    game.once('end', winners => {
      assert.equal(winners, WINNERS.TANNER);
      done();
    });

    game._start();

    game.see('abc'); // nick sees a villager

    // Rory votes for wolfy
    game.vote('ghi', 'abc');

    // Wolfy votes for wolfy
    game.vote('abc', 'abc');

    // Nick votes for wolfy
    game.vote('def', 'abc');

    // Ethan votes for wolfy
    game.vote('mno', 'abc');

    // Nigel votes for wolfy
    game.vote('pqr', 'abc');

    // josh votes for wolfy - ends vote - lynches tanner
    game.vote('jkl', 'abc');

  });

  it('killing the tanner ends the game', done => {

    game.addPlayer({ name: 'wolfy',  id: 'abc'});
    game.addPlayer({ name: 'nick',   id: 'def'});
    game.addPlayer({ name: 'rory',   id: 'ghi'});
    game.addPlayer({ name: 'josh',   id: 'jkl'});
    game.addPlayer({ name: 'ethan',  id: 'mno'});
    game.addPlayer({ name: 'nigel',  id: 'pqr'});

    // assign roles manually
    game.players[0].role = ROLE.COMPLEX_VILLAGER.TANNER; // wolfy is tanner
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.COMPLEX_WOLVES.WOLFMAN; // rory is the ww
    game.players[3].role = ROLE.COMPLEX_WOLVES.MINION; // josh is beholder
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    game.once('end', winners => {
      assert.equal(winners, WINNERS.TANNER);
      done();
    });

    game._start();

    game.see('abc'); // nick sees a villager

    // Rory votes for ethan
    game.vote('ghi', 'mno');

    // Wolfy votes for ethan
    game.vote('abc', 'mno');

    // Nick votes for ethan
    game.vote('def', 'mno');

    // Ethan votes for ethan
    game.vote('mno', 'mno');

    // Nigel votes for ethan
    game.vote('pqr', 'mno');

    // josh votes for ethan - ends vote - lynches ethan
    game.vote('jkl', 'mno');

    // rory kills the tanner - end the game
    game.kill('ghi', 'abc');

  });

  it('insomniac', done => {

    game.addPlayer({ name: 'wolfy',  id: 'wolfy'});
    game.addPlayer({ name: 'nick',   id: 'nick'});
    game.addPlayer({ name: 'rory',   id: 'rory'});
    game.addPlayer({ name: 'josh',   id: 'josh'});
    game.addPlayer({ name: 'ethan',  id: 'ethan'});
    game.addPlayer({ name: 'nigel',  id: 'nigel'});

    // assign roles manually
    game.players[0].role = ROLE.COMPLEX_VILLAGER.INSOMNIAC; // wolfy is insomniac
    game.players[1].role = ROLE.STANDARD.SEER; // nick is seer
    game.players[2].role = ROLE.COMPLEX_WOLVES.WOLFMAN; // rory is the ww
    game.players[3].role = ROLE.COMPLEX_WOLVES.MINION; // josh is beholder
    game.players[4].role = ROLE.STANDARD.VILLAGER; // rest are villager
    game.players[5].role = ROLE.STANDARD.VILLAGER; // rest are villager

    Promise.all([
      new Promise( resolve => {
        game.once('insomniac', (insomniac, wanderer) => {
          assert.equal(wanderer.name, 'rory');
          resolve();
        });
      }),
      new Promise( resolve => {
        game.once('phase:werewolf:start', () => {
          resolve();
        });
      })
    ]).then( () => done() );

    game._start();

    game.see('abc'); // nick sees a villager

    game.vote('wolfy', 'nick');
    game.vote('nigel', 'nick');
    game.vote('nick', 'nick');
    game.vote('rory', 'nick');
    game.vote('ethan', 'nick');
    game.vote('josh', 'nick');

    game.kill('rory', 'nick');

  });

});