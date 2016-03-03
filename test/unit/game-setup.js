'use strict';

const mock = require('mock-require');
mock('../../bot', require('../resources/mock-bot'));
const events = require('../resources/mock-events');
const coreEngine = require('../../core');
const assert = require('assert');
const messages = require('../../res/messages');
const messageStore = require('../resources/mock-message-store');

describe('game setup', function(){

  beforeEach( done => {
    events.deRegisterAll();
    messageStore.clear();
    coreEngine
      .run()
      .then(
        () => done(),
        err => done(err)
      );
  });

  it('should show help text on prompt', () => {
    events.trigger({text: '!help me bot', user: 'foo'});
    assert.equal(messageStore.user[0].msg, messages.help);
  });

  it('should show game starting text', () => {
    events.trigger({text: '!new game please', user: 'foo'});
    assert.equal(messageStore.channel[0], messages.newGame);
  });

  it('should show game in progress is game is already in progress', () => {
    events.trigger({text: '!new game please', user: 'foo'});
    messageStore.clear();
    events.trigger({text: '!new game again'});
    assert.equal(messageStore.channel[0], messages.gameInProgress);
  });

  it('should not join if no game in progress', () => {
    events.trigger({text: '!join me', user: 'foo'});
    assert.equal(messageStore.channel[0], messages.gameNotInProgress);
  });

  it('should join player for new game', () => {
    events.trigger({text: '!new', user: 'foo'});
    assert.equal(messageStore.channel[1], `Current lobby: @bar`);
  });

  it('should allow other players', () => {
    events.trigger({text: '!new', user: 'foo'});
    events.trigger({text: '!join', user: 'bar'});
    assert.equal(messageStore.channel[messageStore.channel.length-1], `Current lobby: @bar, @baz`);
  });

});