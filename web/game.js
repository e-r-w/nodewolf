import * as React from 'react';
import * as Core from '../core';
import * as cookie from 'react-cookie';
import * as messages from '../res/messages';


export default class GameElement extends React.Component {

  constructor(props){

    super(props);
    this.state = {messages:[]};
    const game = props.game;
    let index = 0;

    game

      .on('start', () => {
        this.setState({ messages: this.state.messages.concat([{msg: 'The game has started!', id: index++}])})
      })

      .on('vote:cast', (player, target) => {
        this.setState({ messages: this.state.messages.concat([{msg: `${player.name} has voted for ${target.name}`, id: index++}])});
      })

      .on('tough', toughGuy => {
        this.setState({ messages: this.state.messages.concat([{msg: `${toughGuy.name} survived an attack!`, id: index++}])});
      })

      .on('vote:end', targets => {
        if(targets.length === 1 && targets[0] === 'noone'){
          this.setState({ messages: this.state.messages.concat([{msg: messages.noLynch, id: index++}])});
        }
        else {
          this.setState({ messages: this.state.messages.concat([{
            msg: messages.lynch(
              targets
                .filter(target => target !== 'noone')
                .map(target => game.playerById(target))
                .map(target => `${target.name} (${target.role})`)
                .join(', @')
            ), id: index++
          }])});
        }
      })

      .on('phase:seer:end', (seer, target, side) => {
        this.setState({ messages: this.state.messages.concat([{
          msg: messages.seen(target.name, side), id: index++
        }])});
      })

      .on('phase:guard:end', (bodyguard, guarded) => {
        this.setState({ messages: this.state.messages.concat([{
          msg: messages.guarded(guarded), id: index++
        }])});
      });

    //game.on('phase:day:start', () => {
    //  bot.channelMessage(messages.day(game));
    //});
    //
    //game.on('phase:werewolf:start', () => {
    //  // ask the werewolves to kill someone
    //  game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
    //    bot.userMessage(player, messages.hunt);
    //  });
    //});
    ////
    //game.on('kill:cast', () => {
    //  game._votingWolves().filter( wolf => !wolf.dead ).forEach( player => {
    //    bot.userMessage(player, messages.kill(game));
    //  });
    //});
    //
    //game.on('kill:end', player => {
    //  if(player){
    //    bot.channelMessage(messages.killed(player));
    //  }
    //  else {
    //    bot.channelMessage(messages.notKilled);
    //  }
    //});
    //
    game.on('end', winners => {
      this.setState({ messages: this.state.messages.concat([{msg: 'The game was ended', id: index++}])});
    });
    //
    //game.on('beholder', (beholder, seer) => {
    //  bot.userMessage(beholder.id, messages.seerIs(seer.name));
    //});
    //
    //game.on('minion', (minion, wolves) => {
    //  const werewolves = wolves
    //    .map( player => player.name)
    //    .join(', @');
    //  bot.userMessage(minion.id, messages.werewolvesAre(werewolves));
    //});
  }

  componentWillUnmount() {
    this.props.game.removeAllListeners();
  }

  render() {
    return (
      <div>
        <h3>Nodewolf is running, refresh your browser to restart...</h3>
        {this.state && this.state.messages &&
        this.state.messages.map( message => (
          <div id={message.id}>
            {message.msg}
          </div>
        ))}
      </div>
    );
  }

}