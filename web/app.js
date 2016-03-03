import * as React from 'react';
import {render} from 'react-dom';
import * as Core from '../core';
import * as cookie from 'react-cookie';


class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      slackToken: cookie.load('slackToken') || '',
      slackChannel: cookie.load('slackChannel') || '',
      slackBot: cookie.load('slackBot') || ''
    };
    this.runGame = this.runGame.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  render() {

    if(this.state && this.state.running){
      return <div>
        <h3>Nodewolf is running. Refresh the page to restart</h3>
      </div>
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
      return <div>
        <h3>Enter your room details</h3>
        <div className="form-group">
          <label htmlFor="slackToken">Slack Token</label>
          <input className="form-control" value={ this.state.slackToken } type="text" id="slackToken" onChange={ evt => this.setValue('slackToken', evt.target.value) } />
        </div>
        <div className="form-group">
          <label htmlFor="slackChannel">Slack Channel</label>
          <input className="form-control" value={ this.state.slackChannel } type="text" id="slackChannel" onChange={ evt => this.setValue('slackChannel', evt.target.value) } />
        </div>
        <div className="form-group">
          <label htmlFor="slackBot">Slack Bot Id</label>
          <input className="form-control" value={ this.state.slackBot } type="text" id="slackBot" onChange={ evt => this.setValue( 'slackBot', evt.target.value ) } />
        </div>
        <button className="btn btn-primary" onClick={this.runGame}>
          Go!
        </button>
      </div>
    }

  }

  setValue(name, value){
    const obj = {};
    obj[name] = value;
    this.setState(obj);
    cookie.save(name, value);
  }

  runGame() {
    Core
      .run(this.state.slackToken, this.state.slackChannel, this.state.slackBot)
      .then(
        () => this.setState({running: true, failed: false}),
        err => this.setState({running: false, failed: true})
      );
  }

}

render(
  <App />,
  document.querySelector('#app')
);