'use strict';

const slack = require('slack');
const EventEmitter = require('events');

class Bot extends EventEmitter {

  constructor (token, channel){
    super();
    this.channelName = channel;
    this.token = token;
    this.slack_bot = slack.rtm.client();
    this.slack_bot.message( msg => this._onMessage(msg) );
  }

  channelMessage (msg){
    return new Promise((resolve, reject) => {
      slack.chat.postMessage({token:this.token, channel: this.channel, text: msg, as_user:true, username: 'Moderator'}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  userMessage (usr, msg) {
    return new Promise((resolve, reject) => {
      slack.chat.postMessage({token:this.token, channel: usr, text: msg, as_user:true, username: 'Moderator'}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  start () {
    return new Promise( (resolve, reject) => {
      slack.channels.list({token: this.token}, (err, data) => {
        if(err){
          reject(err);
        }
        else {
          this.channel = data.channels.filter(channel => channel.name === this.channelName)[0].id;
          this.slack_bot.listen({token:this.token});
          this.slack_bot.started( data => {
            this.id = data.self.id;
            this.getUsers().then( data => {
              this.members = data.members;
              resolve();
            })
          });
        }
      });
    });
  }

  getUsers () {
    return new Promise( (resolve, reject) => {
      slack.users.list({token:this.token}, (err, data) => {
        if(err) reject(err);
        else {
          resolve(data);
        }
      });
    });
  }

  _onMessage (msg){
    slack.im.list({token:this.token}, (err, data) => {
      const pm = data.ims.filter(im => im.id === msg.channel)[0];
      if(pm){
        msg.pm = pm.user;
      }
      this.emit('message', msg);
    });
  }

}

module.exports = Bot;