'use strict';

const EventEmitter = require('events');
const mockEvents = require('./mock-events');
const messageStore = require('./mock-message-store');

class MockBot extends EventEmitter {

  constructor (){
    super();
    mockEvents.register( msg => {
      this.emit('message', msg);
    });
  }

  channelMessage (msg){
    messageStore.channel.push(msg);
    return new Promise( resolve => {
      resolve();
    });
  }

  userMessage (usr, msg) {
    messageStore.user.push({usr:usr, msg:msg});
    return new Promise( resolve => {
      resolve();
    });
  }

  start () {
    return new Promise( resolve => resolve() );
  }

  getUsers (){
    return new Promise( resolve => resolve({members: [
      { id: 'foo', name: 'bar' },
      { id: 'bar', name: 'baz' }
    ]}))
  }

}

module.exports = MockBot;