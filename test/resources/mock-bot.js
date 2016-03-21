'use strict';

const EventEmitter = require('events');

class MockBot extends EventEmitter {

  constructor (){
    super();
    this.channel = [];
    this.user = [];
  }

  channelMessage (msg){
    this.channel.push(msg);
    return new Promise( resolve => resolve() );
  }

  userMessage (usr, msg) {
    this.user.push({ usr:usr, msg:msg });
    return new Promise( resolve => resolve() );
  }

  start () {
    return new Promise( resolve => resolve() );
  }

}

module.exports = MockBot;