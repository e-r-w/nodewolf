import * as React from 'react';
import {render} from 'react-dom';
import * as Core from '../core';
import * as cookie from 'react-cookie';
import * as Game from './game';


class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      slackToken: cookie.load('slackToken') || '',
      slackChannel: cookie.load('slackChannel') || ''
    };
    this.runGame = this.runGame.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  render() {

    if(this.state && this.state.running && this.state.game){
      return (
        <div>
          <Game game={this.state.game}/>
        </div>
      );
    }
    else if(this.state && this.state.failed){
      return <div>
        <h3>Slack connection failed.</h3>
        <div>
          <button onClick={ () => this.setState({running: false, failed: false}) } className="btn btn-warning">
            Try again?
          </button>
        </div>
      </div>
    }
    else {
      return <form onSubmit={this.runGame}>
        <h3>Enter your room details</h3>
        <div className="form-group">
          <label htmlFor="slackToken">Slack Token</label>
          <input
            className="form-control"
            value={ this.state.slackToken }
            type="text"
            id="slackToken"
            onChange={ evt => this.setValue('slackToken', evt.target.value) }
          />
        </div>
        <div className="form-group">
          <label htmlFor="slackChannel">Slack Channel</label>
          <input
            className="form-control"
            value={ this.state.slackChannel }
            type="text"
            id="slackChannel"
            onChange={ evt => this.setValue('slackChannel', evt.target.value) }
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Go!
        </button>
      </form>
    }

  }

  setValue(name, value){
    const obj = {};
    obj[name] = value;
    this.setState(obj);
    cookie.save(name, value);
  }

  runGame(evt) {
    evt.preventDefault();
    Core
      .run(this.state.slackToken, this.state.slackChannel)
      .then( game => this.setState({running: true, failed: false, game: game}) )
      .catch( err => this.setState({running: false, failed: true}));
  }

}

render(
  <App />,
  document.querySelector('#app')
);