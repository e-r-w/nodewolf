'use strict';

const slack = require('slack');
const token = require('./token');
const EventEmitter = require('events');

class Bot extends EventEmitter {

  constructor (channel, id){
    super();
    this.channel = channel;
    this.id = id; // @slackbot
    this.slack_bot = slack.rtm.client();
    this.slack_bot.message( msg => this._onMessage(msg) );
  }

  channelMessage (msg){
    return new Promise((resolve, reject) => {
      slack.chat.postMessage({token:token, channel: this.channel, text: msg}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  userMessage (usr, msg) {
    return new Promise((resolve, reject) => {
      slack.chat.postMessage({token:token, channel: usr, text: msg}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  start () {
    return new Promise( resolve => {
      this.slack_bot.listen({token:token});
      this.slack_bot.started( () => resolve() );
    });
  }

  getUsers () {
    return new Promise( (resolve, reject) => {
      slack.users.list({token:token}, (err, data) => {
        if(err) reject(err);
        else resolve(data);
      });
    });
  }

  _onMessage (msg){
    this.emit('message', msg);
  }

}

module.exports = Bot;