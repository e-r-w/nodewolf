import * as React from 'react';
import * as Core from '../core';
import * as cookie from 'react-cookie';
import * as messages from '../res/messages';


export default class GameElement extends React.Component {

  constructor(props){
    super(props);
    this.state = {messages:[]};
    const game = props.game;

    game.on('start', () => {
      this.setState({ messages: this.state.messages.concat(['The game has started!'])})
    });

    game.on('vote:cast', (player, target) => {
      this.setState({ messages: this.state.messages.concat([`${player.name} has voted for ${target.name}`])});
    });

    game.on('tough', toughGuy => {
      this.setState({ messages: this.state.messages.concat([`${toughGuy.name} survived an attack!`])});
    });

    game.on('vote:end', targets => {
      if(targets.length === 1 && targets[0] === 'noone'){
        this.setState({ messages: this.state.messages.concat([messages.noLynch])});
      }
      else {
        this.setState({ messages: this.state.messages.concat([
          messages.lynch(
            targets
              .filter( target => target !== 'noone' )
              .map( target => game.playerById(target) )
              .map( target => `${target.name} (${target.role})` )
              .join(', @')
          )
        ])});
      }
    });

    game.on('phase:seer:end', (seer, target, side) => {
      this.setState({ messages: this.state.messages.concat([
        messages.seen(target.name, side)
      ])});
    });


    game.on('phase:guard:end', (bodyguard, guarded) => {
      this.setState({ messages: this.state.messages.concat([
        messages.guarded(guarded)
      ])});
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
    //game.on('end', winners => {
    //  bot.channelMessage(messages.win(game, winners));
    //});
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

  render() {
    return (
      <div>
        <h3>Nodewolf is running, refresh your browser to restart...</h3>
        {this.state && this.state.messages &&
        this.state.messages.map( message => (
          <div>
            {message}
          </div>
        ))}
      </div>
    );
  }

}